'use server'

import { prisma } from '@/lib/prisma'
import { extractEmailsFromString, extractURLfromString } from '@/lib/utils'
import {
  buildKnowledgeContext,
  buildSystemPrompt,
  getCompletionOptions,
  isExplicitProductCatalogRequest,
  prepareChatHistory,
  sanitizeAssistantResponse,
  shouldInitiateLiveSupport,
  tryQuickAnswer,
  type BotPersonalityConfig,
} from '@/lib/chatbot-ai'
import { onRealTimeChat, onToggleRealtime } from '../conversation'
import { clerkClient } from '@clerk/nextjs'
import { onMailer } from '../mailer'
import { pusherServer } from '@/lib/pusher'
import { generateUUID } from '@/lib/uuid'

function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
}

type OpenAIChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function usesMaxCompletionTokens(model: string): boolean {
  return /^gpt-5|^o[134]/.test(model)
}

async function createOpenAIChatCompletion(
  messages: OpenAIChatMessage[],
  options?: {
    temperature?: number
    max_tokens?: number
    presence_penalty?: number
    frequency_penalty?: number
  }
) {
  const apiKey = process.env.OPEN_AI_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPEN_AI_KEY is not configured')
  }

  const model = getOpenAIModel()
  const maxOutputTokens = options?.max_tokens ?? 900

  const body: Record<string, unknown> = {
    model,
    messages,
  }

  if (usesMaxCompletionTokens(model)) {
    // GPT-5 / o-series: use max_completion_tokens only; temperature must stay at default
    body.max_completion_tokens = maxOutputTokens
  } else {
    body.temperature = options?.temperature ?? 0.5
    body.max_tokens = maxOutputTokens
    body.presence_penalty = options?.presence_penalty ?? 0.1
    body.frequency_penalty = options?.frequency_penalty ?? 0.1
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || 'OpenAI API request failed'
    ) as Error & { status?: number; code?: string }
    error.status = response.status
    error.code = data?.error?.code
    throw error
  }

  return data as {
    choices: Array<{ message: { content: string | null } }>
  }
}

function getOpenAIErrorMessage(error: unknown): string {
  const err = error as { status?: number; code?: string; message?: string }

  if (err?.code === 'unsupported_parameter' || err?.code === 'unsupported_value' || err?.message?.includes('max_completion_tokens') || err?.message?.includes('temperature')) {
    return `The OpenAI model "${getOpenAIModel()}" rejected a request setting. Try OPENAI_MODEL=gpt-4o in .env for broader compatibility, or restart the dev server.`
  }

  if (err?.code === 'invalid_api_key' || err?.status === 401) {
    return 'Your OpenAI API key was rejected. Check OPEN_AI_KEY in .env and restart the dev server.'
  }

  if (err?.status === 404) {
    return `The OpenAI model "${getOpenAIModel()}" is unavailable on your account. Set OPENAI_MODEL=gpt-4o-mini in .env and restart the dev server.`
  }

  if (err?.code === 'insufficient_quota' || err?.message?.includes('exceeded your current quota')) {
    return 'Your OpenAI account has no credits left. Add billing or top up at platform.openai.com, then try again.'
  }

  if (err?.status === 429) {
    return 'OpenAI rate limit reached. Please wait a moment and try again.'
  }

  if (err?.code === 'ERR_STREAM_PREMATURE_CLOSE' || err?.message?.includes('Premature close')) {
    return 'OpenAI connection dropped. Wait a few seconds and try again.'
  }

  return 'AI chat is temporarily unavailable. Please try again in a moment.'
}

export const onStoreConversations = async (
  id: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const attemptStore = async (attempt: number): Promise<any> => {
    try {
      // Verify chat room exists first
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id },
        select: { id: true }
      });

      if (!chatRoom) {
        console.error(`Failed to store message: Chat room ${id} not found`);
        return null;
      }

      // Store the message with timestamp
      const storedMessage = await prisma.chatRoom.update({
        where: { id },
        data: {
          message: {
            create: {
              message,
              role,
              createdAt: new Date(),
              seen: false
            },
          },
          updatedAt: new Date() // Update the chat room timestamp
        },
        include: {
          message: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      // Verify message was stored
      if (!storedMessage.message?.[0]) {
        throw new Error('Message storage verification failed');
      }

      return storedMessage;
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        console.warn(`Attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return attemptStore(attempt + 1);
      }
      console.error('Error storing conversation message after all retries:', error);
      throw error;
    }
  };

  return attemptStore(1);
}

export const onGetCurrentChatBot = async (id: string) => {
  try {
    const chatbot = await prisma.domain.findUnique({
      where: {
        id,
      },
      select: {
        helpdesk: {
          select: {
            id: true,
            title: true,
            question: true,
            answer: true,
            content: true,
            articleType: true,
            category: true,
            tags: true,
            isPublished: true,
            isPinned: true,
            viewCount: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            isPublished: true,
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' }
          ]
        },
        name: true,
        User: {
          select: {
            role: true
          }
        },
        filterQuestions: {
          select: {
            id: true,
            question: true,
          },
        },
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            helpdesk: true,
            iconColor: true,
            iconStyle: true,
            themeColor: true,
            helpDeskColor: true,
            titleColor: true,
            homeTitle: true,
            homeLayout: true,
            chatbotEnabled: true,
            inquiryMode: true,
            productsEnabled: true,
            customLinksEnabled: true,
            popularTopicsEnabled: true,
            popularTopics: true,
            customLinks: {
              select: {
                id: true,
                title: true,
                description: true,
                url: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
            customLinkTitle: true,
            customLinkDescription: true,
            customLinkUrl: true,
          },
        },
        products: {
          where: {
            active: true
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            description: true,
            productType: true,
            hasDiscount: true,
            discountedPrice: true,
            active: true,
            productUrl: true
          }
        }
      },
    })

    // If the domain doesn't exist (e.g., it was deleted), return null
    // This prevents the chatbot from displaying on deleted accounts
    if (!chatbot) {
      console.log(`Domain with ID ${id} not found - possibly deleted`);
      return null;
    }
    
    return chatbot;
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    
    // Only return fallback for errors other than "not found"
    // This allows for error recovery but prevents showing bots for deleted domains
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    
    // Return a fallback placeholder for other types of errors
    return {
      name: 'Support Bot',
      chatBot: {
        id: id,
        welcomeMessage: 'Hello! How can I help you today?',
        helpdesk: false,
        iconStyle: 'Default',
        chatbotEnabled: true,
        inquiryMode: false,
      },
      filterQuestions: [],
      User: { role: 'public' },
      helpdesk: []
    }
  }
}

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: 'assistant' | 'user'; content: string }[],
  author: 'user',
  message: string
) => {
  let customerEmail: string | undefined
  try {
    console.log('Starting AI chatbot assistant flow with message:', message);
    
    // Initialize usage tracking variables
    let currentUsage = 0
    let requestLimit = 100
    let usagePercentage = 0
    let planKey = 'STANDARD'
    
    // ---------------------------------------------
    // 1. Enforce monthly chatbot request limits
    // ---------------------------------------------
    // Fetch the domain to get the owner (user) id
    const domainOwner = await prisma.domain.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (domainOwner?.userId) {
      // Fetch the billing information for the owner
      let billing = await prisma.billings.findUnique({
        where: { userId: domainOwner.userId }
      })

      if (billing) {
        const now = new Date()
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Reset monthly usage if needed
        if (!(billing as any).lastChatReset || (billing as any).lastChatReset < startOfCurrentMonth) {
          billing = await prisma.billings.update({
            where: { id: billing.id },
            data: {
              chatRequests: 0,
              lastChatReset: now
            }
          } as any)
        }

        // Determine usage limit based on plan
        planKey = (billing.plan || 'STANDARD').toUpperCase()
        requestLimit = planKey === 'PRO' ? 1000 : 100 // Default to free/standard limit
        currentUsage = (billing as any).chatRequests || 0
        usagePercentage = (currentUsage / requestLimit) * 100

        // Send warning notification at 80% usage (only once per billing period)
        if (usagePercentage >= 80 && usagePercentage < 100) {
          const warningKey = `usage_warning_${(billing as any).lastChatReset?.getTime() || Date.now()}`
          
          // Check if we already sent a warning for this billing period
          const existingWarning = await prisma.notification.findFirst({
            where: {
              userId: domainOwner.userId,
              type: 'PLAN_UPGRADE',
              message: {
                contains: '80% of your monthly'
              },
              createdAt: {
                gte: (billing as any).lastChatReset || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          })

          if (!existingWarning) {
            try {
              await prisma.notification.create({
                data: {
                  type: 'PLAN_UPGRADE',
                  message: `You've used 80% of your monthly chatbot requests (${currentUsage}/${requestLimit}). ${planKey === 'PRO' ? 'Consider enabling usage-based billing.' : 'Consider upgrading to Pro plan for 1,000 requests/month.'}`,
                  userId: domainOwner.userId,
                  domainId: id
                }
              })
            } catch (notifError) {
              console.error('Failed to create warning notification:', notifError)
            }
          }
        }

        if (currentUsage >= requestLimit) {
          // Create notification for the domain owner about reaching limit
          try {
            await prisma.notification.create({
              data: {
                type: 'PLAN_UPGRADE',
                message: planKey === 'PRO' 
                  ? `Your Pro plan has reached its monthly limit of ${requestLimit} chatbot requests. Consider enabling usage-based billing.`
                  : `Your free plan has reached its monthly limit of ${requestLimit} chatbot requests. Upgrade to Pro for 1,000 requests/month.`,
                userId: domainOwner.userId,
                domainId: id
              }
            })
          } catch (notifError) {
            console.error('Failed to create limit notification:', notifError)
          }

          const overLimitMessage = planKey === 'PRO'
            ? `Hi there! 👋 This chat assistant has reached its monthly usage limit. The site owner has been notified and can enable additional usage or contact support for assistance. Thank you for your understanding! 💙`
            : `Hi there! 👋 This chat assistant has reached its monthly usage limit. The site owner has been notified about upgrading to continue our conversation. Thank you for your patience! 💙`

          return {
            response: {
              role: 'assistant' as const,
              content: overLimitMessage
            }
          }
        }

        // Increment usage counter for this request
        await prisma.billings.update({
          where: { id: billing.id },
          data: { chatRequests: { increment: 1 } } as any
        })
      }
    }

    // Extract email from message if present - use more comprehensive pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = message.match(emailPattern);
    const extractedEmail = extractEmailsFromString(message);
    
    if (emailMatch && emailMatch[0]) {
      console.log('Email extracted using direct pattern:', emailMatch[0]);
      customerEmail = emailMatch[0];
    } else if (extractedEmail && extractedEmail.length > 0) {
      console.log('Email extracted using helper function:', extractedEmail[0]);
      customerEmail = extractedEmail[0];
    } else {
      console.log('No email detected in message');
      
      // Check in previous messages
      const previousMessages = chat.filter(msg => msg.role === 'user');
      for (const prevMsg of previousMessages) {
        const prevEmailMatch = prevMsg.content.match(emailPattern);
        const prevExtractedEmail = extractEmailsFromString(prevMsg.content);
        
        if (prevEmailMatch && prevEmailMatch[0]) {
          console.log('Email found in previous message:', prevEmailMatch[0]);
          customerEmail = prevEmailMatch[0];
          break;
        } else if (prevExtractedEmail && prevExtractedEmail.length > 0) {
          console.log('Email extracted from previous message:', prevExtractedEmail[0]);
          customerEmail = prevExtractedEmail[0];
          break;
        }
      }
    }

    type CustomerType = {
      name: string;
      User: {
        id: string;
        subscription: {
          plan: string;
          credits: number;
        } | null;
      } | null;
      customer: Array<{
        id: string;
        email: string | null;
        questions: Array<{
          id: string;
          question: string;
          answered: string | null;
          customerId: string;
        }>;
        chatRoom: Array<{
          id: string;
          live: boolean;
          mailed: boolean;
        }>;
      }>;
    } | null;
    
    let checkCustomer: CustomerType = null;

    // For storing conversations
    const storeMessage = async (content: string) => {
      if (checkCustomer?.customer[0]?.chatRoom[0]?.id) {
        await onStoreConversations(
          checkCustomer.customer[0].chatRoom[0].id,
          content,
          'assistant'
        )
      }
    }

    // If email found, check/create customer
    if (customerEmail) {
      
      // Check if customer exists
      checkCustomer = await prisma.domain.findUnique({
        where: {
          id,
        },
        select: {
          name: true,
          User: {
            select: {
              id: true,
              subscription: {
                select: {
                  plan: true,
                  credits: true
                }
              }
            }
          },
          customer: {
            where: {
              email: {
                startsWith: customerEmail,
              },
            },
            select: {
              id: true,
              email: true,
              questions: true,
              chatRoom: {
                select: {
                  id: true,
                  live: true,
                  mailed: true,
                },
              },
            },
          },
        },
      })

      // Check billing limits before creating new customer
      if (checkCustomer && !checkCustomer.customer.length) {
        // Get current customer count
        const currentCustomerCount = await prisma.customer.count({
          where: {
            domainId: id
          }
        });

        // Get user's plan limits
        const userPlan = checkCustomer.User?.subscription?.plan || 'STANDARD';
        const planLimits = {
          'STANDARD': 10,
          'PRO': 50
        };

        const customerLimit = planLimits[userPlan as keyof typeof planLimits];

        // Check if creating a new customer would exceed the limit
        if (currentCustomerCount >= customerLimit) {
          return {
            response: {
              role: 'assistant' as const,
              content: `I apologize, but this account has reached its maximum limit of ${customerLimit} contacts under the ${userPlan} plan. Please upgrade your plan to add more contacts or contact support for assistance.`
            }
          };
        }

        // If within limits, create new customer
        const newCustomer = await prisma.domain.update({
          where: {
            id,
          },
          data: {
            customer: {
              create: {
                email: customerEmail,
                chatRoom: {
                  create: {},
                },
              },
            },
          },
        })
        
        if (newCustomer) {
          // Refresh customer data after creation
          checkCustomer = await prisma.domain.findUnique({
            where: {
              id,
            },
            select: {
              name: true,
              User: {
                select: {
                  id: true,
                  subscription: {
                    select: {
                      plan: true,
                      credits: true
                    }
                  }
                }
              },
              customer: {
                where: {
                  email: {
                    startsWith: customerEmail,
                  },
                },
                select: {
                  id: true,
                  email: true,
                  questions: true,
                  chatRoom: {
                    select: {
                      id: true,
                      live: true,
                      mailed: true,
                    },
                  },
                },
              },
            },
          })
        }
      }
    }

    const chatBotDomain = await prisma.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        User: {
          select: {
            role: true,
            id: true
          }
        },
        chatBot: {
          select: {
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            helpdesk: true,
            iconColor: true,
            iconStyle: true,
            businessDescription: true,
            handoffPreference: true,
            industry: true,
            personality: true,
            responseStyle: true,
            tone: true,
            freeShippingThreshold: true,
            shippingCosts: true,
            shippingEnabled: true,
            shippingRegions: true,
            shippingTime: true,
            productsEnabled: true,
          }
        },
        filterQuestions: {
          select: {
            question: true,
            answered: true,
          },
        },
        products: {
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            description: true,
            productType: true,
            hasDiscount: true,
            discountedPrice: true,
            active: true,
            productUrl: true
          },
        },
        bookings: {
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        helpdesk: {
          where: {
            isPublished: true,
          },
          select: {
            title: true,
            question: true,
            answer: true,
            content: true,
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 20,
        },
      },
    })

    if (chatBotDomain) {
      const knowledge = buildKnowledgeContext({
        filterQuestions: chatBotDomain.filterQuestions,
        helpdesk: chatBotDomain.helpdesk,
        products: chatBotDomain.products || [],
        bookings: chatBotDomain.bookings || [],
      })

      const quickAnswer = tryQuickAnswer(message, knowledge)
      if (quickAnswer) {
        return {
          response: {
            role: 'assistant' as const,
            content: quickAnswer,
          },
        }
      }

      const isProductQuery =
        isExplicitProductCatalogRequest(message) &&
        !!chatBotDomain.chatBot?.productsEnabled &&
        !!chatBotDomain.products?.length

      // Extract filtering criteria from the message
      const extractFilteringCriteria = (message: string, previousMessages: { role: string; content: string }[]) => {
        // For price filtering
        const priceRanges = [
          { pattern: /under\s+\$?(\d+)/i, range: (match: RegExpMatchArray) => ({ min: 0, max: parseInt(match[1]) }) },
          { pattern: /less\s+than\s+\$?(\d+)/i, range: (match: RegExpMatchArray) => ({ min: 0, max: parseInt(match[1]) }) },
          { pattern: /more\s+than\s+\$?(\d+)/i, range: (match: RegExpMatchArray) => ({ min: parseInt(match[1]), max: Number.MAX_SAFE_INTEGER }) },
          { pattern: /over\s+\$?(\d+)/i, range: (match: RegExpMatchArray) => ({ min: parseInt(match[1]), max: Number.MAX_SAFE_INTEGER }) },
          { pattern: /between\s+\$?(\d+)\s+and\s+\$?(\d+)/i, range: (match: RegExpMatchArray) => ({ min: parseInt(match[1]), max: parseInt(match[2]) }) },
          { pattern: /\$?(\d+)\s*-\s*\$?(\d+)/i, range: (match: RegExpMatchArray) => ({ min: parseInt(match[1]), max: parseInt(match[2]) }) }
        ];

        // Create a filtering context with proper typing
        const filteringContext: {
          priceRange: { min: number; max: number };
          productType: string | null;
          searchTerms: string[];
          hasDiscount: boolean;
        } = {
          priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
          productType: null,
          searchTerms: [],
          hasDiscount: false
        };

        // Extract from current message
        const combinedText = message.toLowerCase();

        // Check for price ranges
        for (const pricePattern of priceRanges) {
          const match = combinedText.match(pricePattern.pattern);
          if (match) {
            const range = pricePattern.range(match);
            filteringContext.priceRange.min = range.min;
            filteringContext.priceRange.max = range.max;
          }
        }

        // Check for product types
        const typeMatches = combinedText.match(/(laptop|phone|tech|clothing|accessory|accessories|shoe|shoes|book|electronics|furniture|toy|game|food|beauty|health|sport|sports|outdoor|tool|tools|kitchen|home|office|car|automotive|jewelry|art|music|movie|films|film)/gi);
        if (typeMatches) {
          filteringContext.productType = typeMatches[0].toLowerCase();
        }

        // Check for discount mentions
        if (combinedText.includes('discount') || combinedText.includes('deal') || combinedText.includes('sale') || combinedText.includes('offer') || combinedText.includes('promotion')) {
          filteringContext.hasDiscount = true;
        }

        // Extract keywords for name/description search
        const keywords = combinedText.split(/\s+/)
          .filter(word => word.length > 3) // Only consider longer words as potential keywords
          .filter(word => !['show', 'what', 'have', 'your', 'products', 'available', 'would', 'like', 'looking', 'want', 'need'].includes(word))
          .slice(0, 5); // Limit to 5 keywords for relevance

        filteringContext.searchTerms = keywords;

        // Also check previous messages for context
        const lastUserMessages = previousMessages
          .filter(msg => msg.role === 'user')
          .slice(-3) // Consider last 3 user messages for context
          .map(msg => msg.content.toLowerCase());

        for (const prevMsg of lastUserMessages) {
          // Look for additional product types
          const prevTypeMatches = prevMsg.match(/(laptop|phone|tech|clothing|accessory|accessories|shoe|shoes|book|electronics|furniture|toy|game|food|beauty|health|sport|sports|outdoor|tool|tools|kitchen|home|office|car|automotive|jewelry|art|music|movie|films|film)/gi);
          if (prevTypeMatches && !filteringContext.productType) {
            filteringContext.productType = prevTypeMatches[0].toLowerCase();
          }

          // Add additional keywords
          const prevKeywords = prevMsg.split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['show', 'what', 'have', 'your', 'products', 'available', 'would', 'like', 'looking', 'want', 'need'].includes(word))
            .slice(0, 3);
          
          filteringContext.searchTerms = [...filteringContext.searchTerms, ...prevKeywords];
        }

        return filteringContext;
      };

      // Filter and sort products based on criteria
      const getRecommendedProducts = (products: any[], filteringContext: any) => {
        // Start with all products
        let filteredProducts = [...products];

        // Apply price filter
        filteredProducts = filteredProducts.filter(product => {
          const price = product.hasDiscount && product.discountedPrice ? product.discountedPrice : product.price;
          return price >= filteringContext.priceRange.min && price <= filteringContext.priceRange.max;
        });

        // Apply product type filter if specified
        if (filteringContext.productType) {
          const typeFilteredProducts = filteredProducts.filter(product => 
            product.productType && 
            product.productType.toLowerCase().includes(filteringContext.productType)
          );
          
          // Only apply type filtering if it doesn't eliminate too many products
          if (typeFilteredProducts.length > 0) {
            filteredProducts = typeFilteredProducts;
          }
        }

        // Apply discount filter if requested
        if (filteringContext.hasDiscount) {
          const discountedProducts = filteredProducts.filter(product => product.hasDiscount);
          // Only apply if we have enough discounted products
          if (discountedProducts.length > 0) {
            filteredProducts = discountedProducts;
          }
        }

        // Score products by relevance to search terms
        if (filteringContext.searchTerms.length > 0) {
          filteredProducts = filteredProducts.map(product => {
            let score = 0;
            const productText = `${product.name} ${product.description || ''} ${product.productType || ''}`.toLowerCase();
            
            filteringContext.searchTerms.forEach((term: string) => {
              if (productText.includes(term.toLowerCase())) {
                // Higher score for matches in name than description
                if (product.name.toLowerCase().includes(term.toLowerCase())) {
                  score += 10;
                } else {
                  score += 5;
                }
              }
            });
            
            return { ...product, relevanceScore: score };
          })
          .filter(product => product.relevanceScore > 0) // Only include products with some relevance
          .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance score
        }

        // If still too many products, sort by price and take a representative sample
        if (filteredProducts.length > 7) {
          // Sort by price ascending
          filteredProducts.sort((a, b) => {
            const priceA = a.hasDiscount && a.discountedPrice ? a.discountedPrice : a.price;
            const priceB = b.hasDiscount && b.discountedPrice ? b.discountedPrice : b.price;
            return priceA - priceB;
          });

          // Take a representative sample (low, mid, and high price points)
          const sampledProducts = [];
          // 2 from low price range
          sampledProducts.push(...filteredProducts.slice(0, 2));
          // 2-3 from middle price range
          const midIndex = Math.floor(filteredProducts.length / 2);
          sampledProducts.push(...filteredProducts.slice(midIndex - 1, midIndex + 2));
          // 2 from high price range
          sampledProducts.push(...filteredProducts.slice(filteredProducts.length - 2));

          // Remove duplicates and limit to 7
          filteredProducts = Array.from(new Set(sampledProducts)).slice(0, 7);
        }

        // Limit to 7 products maximum
        return filteredProducts.slice(0, 7);
      };

      if (isProductQuery && chatBotDomain.chatBot?.productsEnabled && chatBotDomain.products && chatBotDomain.products.length > 0) {
        // If too many products, use filtering
        if (chatBotDomain.products.length > 7) {
          const filteringContext = extractFilteringCriteria(message, chat);
          const recommendedProducts = getRecommendedProducts(chatBotDomain.products, filteringContext);

          // Construct an appropriate response
          let responseContent = "Here are some products that might interest you:";
          
          // If we applied significant filtering, explain the criteria
          if (filteringContext.productType || filteringContext.hasDiscount || 
              filteringContext.priceRange.min > 0 || 
              filteringContext.priceRange.max < Number.MAX_SAFE_INTEGER) {
            
            const criteria = [];
            if (filteringContext.productType) {
              criteria.push(`${filteringContext.productType} products`);
            }
            if (filteringContext.hasDiscount) {
              criteria.push("items with discounts");
            }
            if (filteringContext.priceRange.min > 0 && filteringContext.priceRange.max < Number.MAX_SAFE_INTEGER) {
              criteria.push(`items between $${filteringContext.priceRange.min} and $${filteringContext.priceRange.max}`);
            } else if (filteringContext.priceRange.min > 0) {
              criteria.push(`items over $${filteringContext.priceRange.min}`);
            } else if (filteringContext.priceRange.max < Number.MAX_SAFE_INTEGER) {
              criteria.push(`items under $${filteringContext.priceRange.max}`);
            }
            
            if (criteria.length > 0) {
              responseContent = `Based on your interest in ${criteria.join(', ')}, here are some products that might interest you:`;
            }
          }

          // Add a note if we limited the results
          if (chatBotDomain.products.length > 7) {
            responseContent += `\n\nThese are ${recommendedProducts.length} selected products from our catalog of ${chatBotDomain.products.length} items.`;
          }

          // Add a question to refine further
          responseContent += "\n\nWould you like me to help narrow down your options further? Please let me know any specific features, price range, or product types you're interested in.";

          const response = {
            role: 'assistant' as const,
            content: responseContent,
            products: recommendedProducts.map(product => ({
              id: product.id,
              name: product.name,
              price: product.price,
              image: `https://ucarecdn.com/${product.image}/`,
              description: product.description,
              productType: product.productType,
              hasDiscount: product.hasDiscount,
              discountedPrice: product.discountedPrice,
              active: product.active,
              productUrl: product.productUrl
            }))
          };

          // Store just the text content
          if (checkCustomer?.customer[0]?.chatRoom[0]?.id) {
            await onStoreConversations(
              checkCustomer.customer[0].chatRoom[0].id,
              response.content,
              'assistant'
            );
          }

          return { response };
        } else {
          // If we have 7 or fewer products, show all of them
          const response = {
            role: 'assistant' as const,
            content: "Here are our available products:",
            products: chatBotDomain.products.map((product: any) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              image: `https://ucarecdn.com/${product.image}/`,
              description: product.description,
              productType: product.productType,
              hasDiscount: product.hasDiscount,
              discountedPrice: product.discountedPrice,
              active: product.active,
              productUrl: product.productUrl
            }))
          };

          // Store just the text content
          if (checkCustomer?.customer[0]?.chatRoom[0]?.id) {
            await onStoreConversations(
              checkCustomer.customer[0].chatRoom[0].id,
              response.content,
              'assistant'
            );
          }

          return { response };
        }
      }

      const botConfig: BotPersonalityConfig = {
        personality: chatBotDomain.chatBot?.personality || 'professional',
        tone: chatBotDomain.chatBot?.tone || 'friendly',
        businessDescription:
          chatBotDomain.chatBot?.businessDescription ||
          `${chatBotDomain.name} provides customer support and assistance.`,
        industry: chatBotDomain.chatBot?.industry || 'general',
        responseStyle: chatBotDomain.chatBot?.responseStyle || 'clear and helpful',
        handoffPreference: chatBotDomain.chatBot?.handoffPreference || 'moderate',
        shippingEnabled: chatBotDomain.chatBot?.shippingEnabled || false,
        shippingTime: chatBotDomain.chatBot?.shippingTime || '3-5 business days',
        shippingRegions: chatBotDomain.chatBot?.shippingRegions || ['domestic'],
        freeShippingThreshold: chatBotDomain.chatBot?.freeShippingThreshold || null,
        productsEnabled: chatBotDomain.chatBot?.productsEnabled || false,
      }

      const systemMessage = buildSystemPrompt(
        chatBotDomain.name,
        botConfig,
        knowledge
      )
      const conversationHistory = prepareChatHistory(chat, message)
      const completionOptions = getCompletionOptions()

      const chatCompletion = await createOpenAIChatCompletion(
        [
          { role: 'system', content: systemMessage },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        completionOptions
      );

      const rawAssistantContent =
        chatCompletion.choices[0].message.content?.trim() || ''
      const assistantContent = sanitizeAssistantResponse(rawAssistantContent)

      let isLiveSupportRequested = shouldInitiateLiveSupport(
        message,
        rawAssistantContent,
        conversationHistory,
        customerEmail
      );

      if (isLiveSupportRequested) {
        let chatRoomId;
        let customerId;

        console.log('Live support requested with email:', customerEmail);

        // If no email provided, ask for it
        if (!customerEmail) {
          console.log('No email provided, asking user for email');
          const response = {
            role: 'assistant',
            content: "Before I connect you with our live support team, I'll need your email address so our team can better assist you. Could you please share your email address?",
          };
          return { response };
        }

        console.log('Email detected:', customerEmail, 'Checking for existing customer');

        // Check for any existing chat room for this email
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            email: customerEmail,
            domainId: id
          },
          select: {
            id: true,
            email: true,
            chatRoom: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1,
              select: {
                id: true,
                live: true,
                message: {
                  orderBy: {
                    createdAt: 'asc'
                  },
                  select: {
                    id: true,
                    message: true,
                    role: true,
                    createdAt: true,
                    seen: true
                  }
                }
              }
            }
          }
        });

        console.log('Existing customer check result:', existingCustomer ? 'Found' : 'Not found');

        if (existingCustomer) {
          customerId = existingCustomer.id;
          
          if (existingCustomer.chatRoom && existingCustomer.chatRoom.length > 0) {
            chatRoomId = existingCustomer.chatRoom[0]?.id;
            console.log('Using existing chat room:', chatRoomId);

            // If chat room exists, add the new message to it
            if (chatRoomId) {
              const existingMessages = existingCustomer.chatRoom[0]?.message || []
              const existingContents = new Set(
                existingMessages.map((entry) => `${entry.role}:${entry.message.trim()}`)
              )

              for (const turn of chat) {
                const content = turn.content?.trim()
                if (!content) continue

                const key = `${turn.role}:${content}`
                if (existingContents.has(key)) continue

                await prisma.chatMessage.create({
                  data: {
                    chatRoomId,
                    message: content,
                    role: turn.role,
                    seen: true,
                  },
                })
                existingContents.add(key)
              }

              const currentMessageKey = `user:${message.trim()}`
              if (!existingContents.has(currentMessageKey)) {
                await prisma.chatMessage.create({
                  data: {
                    chatRoomId,
                    message,
                    role: 'user',
                    seen: false,
                  },
                })
              }
              console.log('Synced conversation history to existing chat room');

              // Already in live mode — don't re-initiate (avoids duplicate system messages)
              if (existingCustomer.chatRoom[0]?.live) {
                return {
                  response: {
                    role: 'assistant',
                    content:
                      "You're already connected with our live support team. A team member will respond shortly.",
                  },
                  live: true,
                  chatRoom: chatRoomId,
                  supportAgent: {
                    name: 'AI Assistant',
                    role: 'support',
                  },
                };
              }
            }
          } else {
            console.log('Customer exists but has no chat room, creating new one');
            const newChatRoom = await prisma.chatRoom.create({
              data: {
                customerId: customerId,
                live: false
              }
            });
            chatRoomId = newChatRoom.id;
            console.log('Created new chat room:', chatRoomId);
          }
        } else {
          // Create new customer with email
          console.log('Creating new customer with email:', customerEmail);
          const newCustomer = await prisma.customer.create({
            data: {
              email: customerEmail,
              domainId: id,
            }
          });
          customerId = newCustomer.id;
          console.log('Created new customer with ID:', customerId);
        }
        
        // Create chat room only if one doesn't exist
        if (!chatRoomId) {
          console.log('No chat room ID yet, creating new chat room');
          // Get all previous messages from the conversation
          const previousMessages = chat.map(msg => ({
            message: msg.content,
            role: msg.role,
            seen: true
          }));

          // Create new chat room with all previous messages
          const newChatRoom = await prisma.chatRoom.create({
            data: {
              customerId: customerId,
              live: false,
              message: {
                create: [
                  ...previousMessages,
                  {
                    message: message,
                    role: "user",
                    seen: false
                  }
                ]
              }
            },
            include: {
              message: true
            }
          });
          chatRoomId = newChatRoom.id;
          console.log('Created new chat room with ID:', chatRoomId);
        }

        // Ensure we have a valid chat room ID at this point
        if (!chatRoomId) {
          console.error('Failed to create or retrieve a chat room');
          return {
            response: {
              role: 'assistant',
              content: "I'm having trouble connecting you to live support. Please try again later."
            }
          };
        }

        // Get domain owner's details for notification
        const domainOwner = await prisma.domain.findUnique({
          where: { id },
          select: {
            name: true,
            User: {
              select: {
                id: true,
                fullname: true,
                email: true,
                clerkId: true,
              },
            },
          },
        });

        console.log('Domain owner lookup result:', domainOwner);
        
        // If domainOwner.User is undefined, try to get admin user as fallback
        let adminUser = null;
        if (!domainOwner?.User) {
          console.log('Domain owner User not found, looking for admin user');
          adminUser = await prisma.user.findFirst({
            where: {
              role: 'ADMIN'
            },
            select: {
              id: true,
              fullname: true,
              email: true,
              clerkId: true
            }
          });
          console.log('Admin user lookup result:', adminUser);
        }

        // Use either domain owner or admin user
        const notificationRecipient = domainOwner?.User || adminUser;
        console.log('Notification recipient:', notificationRecipient);

        // Set up support agent object
        const supportAgent = {
          name: 'AI Assistant',
          role: 'support'
        };

        // UPDATE CHAT ROOM DIRECTLY instead of using onToggleRealtime
        console.log('Directly updating chat room live status to true');
        
        try {
          // Step 1: Update the database directly
          const updatedRoom = await prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: { live: true },
          });
          
          console.log('Database update result:', updatedRoom);
          
          // Step 2: Send Pusher notifications directly
          console.log('Sending Pusher notifications directly');
          
          // First notification - mode change channel
          console.log('Sending mode-change notification with supportAgent:', supportAgent);
          if (pusherServer) {
            await pusherServer.trigger(`${chatRoomId}-mode`, 'mode-change', {
              live: true,
              supportAgent
            });
          }
          
          // System message
          const systemMessage = {
            role: 'assistant' as const,
            message: 'Live support mode has been enabled.',
            createdAt: new Date(),
            seen: false
          };
          
          // Store system message
          const msgResult = await prisma.chatMessage.create({
            data: {
              chatRoomId,
              message: systemMessage.message,
              role: systemMessage.role,
              seen: systemMessage.seen
            }
          });
          
          console.log('System message created:', msgResult);
          
          // Second notification - realtime mode channel
          if (pusherServer) {
            await pusherServer.trigger(chatRoomId, 'realtime-mode', {
              chat: systemMessage
            });
          }
          
          console.log('All Pusher notifications sent successfully');
          
          // Create notifications only if domain owner exists
          if (notificationRecipient) {
            try {
              // Send email notification
              const mailResult = await onMailer(
                notificationRecipient.fullname || 'Support Agent',
                domainOwner?.name || 'Your Website',
                customerEmail,
                message
              );
              console.log('Email notification result:', mailResult);
              
              // Create notification for live support request
              if (notificationRecipient.id) {
                const notification = await prisma.notification.create({
                  data: {
                    type: 'LIVE_SUPPORT',
                    message: `Live support requested by ${customerEmail}. Message: ${message}`,
                    userId: notificationRecipient.id,
                    domainId: id,
                  },
                });
                console.log('Created notification:', notification);

                // Trigger real-time notification
                try {
                  if (pusherServer) {
                    await pusherServer.trigger(`user-${notificationRecipient.id}`, 'notification', notification);
                    console.log('Pusher notification sent to user:', notificationRecipient.id);
                    
                    // Also send to global channel as backup
                    await pusherServer.trigger('chat-global', 'new-conversation', {
                      chatRoomId,
                      customerEmail,
                      message,
                      domainId: id,
                      timestamp: new Date().toISOString()
                    });
                  }
                  console.log('Sent backup notification to chat-global channel');
                } catch (pusherError) {
                  console.error('Error sending Pusher notification:', pusherError);
                }
              }
            } catch (notificationError) {
              console.error('Error sending notification:', notificationError);
            }
          }
          
          const response = {
            role: 'assistant',
            content: "I'll connect you with our live support team right away. One of our team members will be with you shortly to assist you better.",
          };

          console.log('Sending transition message');

          // Generate a proper UUID v4 for the message ID
          const messageId = generateUUID();
          
          console.log('Sending message via onRealTimeChat with UUID:', messageId);
          
          await onRealTimeChat(
            chatRoomId,
            response.content,
            messageId,
            'assistant',
            supportAgent
          );

          return { 
            response,
            live: true,
            chatRoom: chatRoomId,
            supportAgent
          };
        } catch (updateError) {
          console.error('Error during direct update:', updateError);
          return {
            response: {
              role: 'assistant',
              content: "I'm having trouble connecting you to live support. Please try again later."
            }
          };
        }
      }

      if (chatCompletion) {
        let content = assistantContent || rawAssistantContent;
        
        // Add customer warning when approaching limit (90-99%)
        if (usagePercentage >= 90 && usagePercentage < 100) {
          content += "\n\nNote: This chat support is approaching its monthly usage limit. If you need immediate assistance, please contact support directly."
        }
        
        // Look for URLs in the format /portal/...
        const portalLinkMatch = content.match(/\/portal\/[a-zA-Z0-9-]+\/(?:payment|appointment)\/[a-zA-Z0-9-]+/);
        
        if (portalLinkMatch) {
          const response = {
            role: 'assistant',
            content,
            link: portalLinkMatch[0],
          }

          await storeMessage(response.content)
          return { response }
        }

        const response = {
          role: 'assistant',
          content,
        }

        await storeMessage(response.content)
        return { response }
      }
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      response: {
        role: 'assistant',
        content: getOpenAIErrorMessage(error),
      },
    }
  }
}

