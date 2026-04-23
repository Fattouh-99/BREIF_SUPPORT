'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

export const getUserClients = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const clients = await client.customer.count({
        where: {
          Domain: {
            User: {
              clerkId: user.id,
            },
          },
        },
      })
      if (clients) {
        return clients
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserBalance = async () => {
  try {
    const user = await currentUser()
    if (!user) return 0

    const connectedStripe = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        stripeId: true,
      },
    })

    if (!connectedStripe?.stripeId) {
      return 0
    }

    try {
      const transactions = await stripe.balance.retrieve({
        stripeAccount: connectedStripe.stripeId,
      })

      if (transactions) {
        const sales = transactions.pending.reduce((total, next) => {
          return total + next.amount
        }, 0)

        return sales / 100
      }
    } catch (stripeError) {
      console.log('Stripe error:', stripeError)
      return 0
    }

    return 0
  } catch (error) {
    console.log('General error:', error)
    return 0
  }
}

export const getUserPlanInfo = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const plan = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          _count: {
            select: {
              domains: true,
            },
          },
          subscription: {
            select: {
              plan: true,
              credits: true,
              currentPeriodEnd: true,
              stripeSubscriptionId: true,
              status: true,
            },
          },
        },
      })
      if (plan) {
        return {
          plan: plan.subscription?.plan,
          credits: plan.subscription?.credits,
          domains: plan._count.domains,
          currentPeriodEnd: plan.subscription?.currentPeriodEnd,
          hasActiveSubscription: plan.subscription?.status === 'active',
          stripeSubscriptionId: plan.subscription?.stripeSubscriptionId,
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserTotalProductPrices = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const products = await client.product.findMany({
        where: {
          Domain: {
            User: {
              clerkId: user.id,
            },
          },
        },
        select: {
          price: true,
        },
      })

      if (products) {
        const total = products.reduce((total, next) => {
          // Convert Decimal to number before adding
          return total + parseFloat(next.price.toString())
        }, 0)

        return total
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserProductsCount = async () => {
  try {
    const user = await currentUser()
    if (!user) return 0

    const productsCount = await client.product.count({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
      },
    })

    return productsCount
  } catch (error) {
    console.error('Error getting products count:', error)
    return 0
  }
}

export const getUserTransactions = async () => {
  try {
    const user = await currentUser()
    if (!user) return { data: [], has_more: false }

    const dbUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        stripeId: true,
      },
    })

    if (!dbUser) return { data: [], has_more: false }

    if (!dbUser.stripeId) {
      // Get subscription payments for the current user only
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 10,
        expand: ['data.latest_charge'],
      });

      // Filter and format subscription payments
      const subscriptionCharges = paymentIntents.data
        .filter(pi => 
          (pi.metadata?.type === 'subscription' || pi.metadata?.type === 'plan_purchase') && 
          pi.metadata?.userId === dbUser.id
        )
        .map(pi => ({
          id: pi.id,
          amount: pi.amount,
          calculated_statement_descriptor: pi.description || 'Plan Purchase',
          created: pi.created,
          status: pi.status
        }));

      return { 
        data: subscriptionCharges,
        has_more: paymentIntents.has_more 
      };
    }

    try {
      // Get both subscription payments and connected account charges for the current user
      const [subscriptionPayments, connectedCharges] = await Promise.all([
        stripe.paymentIntents.list({
          limit: 5,
          expand: ['data.latest_charge'],
        }),
        stripe.charges.list(
          { limit: 5 },
          { stripeAccount: dbUser.stripeId }
        )
      ]);

      // Combine and sort all transactions, ensuring they belong to the current user
      const allTransactions = [
        ...subscriptionPayments.data
          .filter(pi => 
            (pi.metadata?.type === 'subscription' || pi.metadata?.type === 'plan_purchase') && 
            pi.metadata?.userId === dbUser.id
          )
          .map(pi => ({
            id: pi.id,
            amount: pi.amount,
            calculated_statement_descriptor: pi.description || 'Plan Purchase',
            created: pi.created,
            status: pi.status
          })),
        ...connectedCharges.data
      ].sort((a, b) => b.created - a.created);

      return {
        data: allTransactions.slice(0, 10),
        has_more: subscriptionPayments.has_more || connectedCharges.has_more
      };

    } catch (stripeError) {
      console.log('Stripe error:', stripeError)
      return { data: [], has_more: false }
    }
  } catch (error) {
    console.log('General error:', error)
    return { data: [], has_more: false }
  }
}

export const isStripeConnected = async () => {
  try {
    const user = await currentUser()
    if (!user) return false

    const connectedStripe = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        stripeId: true,
      },
    })

    return !!connectedStripe?.stripeId
  } catch (error) {
    console.log('Error checking Stripe connection:', error)
    return false
  }
}

// Dashboard preference functionality removed - no longer needed

export const getChatStats = async () => {
  try {
    const user = await currentUser()
    if (!user) return { 
      daily: 0, 
      monthly: 0, 
      prevDaily: 0, 
      monthlyAvg: 0,
      activeChats: 0,
      avgResponseTime: 0,
      satisfactionRate: 0
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Get the beginning of the previous month for monthly average comparison
    const firstDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    
    // Days in current month for average calculation
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const currentDay = today.getDate()

    // Fetch all chat rooms with additional metrics
    const chatRooms = await client.chatRoom.findMany({
      where: {
        Customer: {
          Domain: {
            User: {
              clerkId: user.id
            }
          }
        },
        createdAt: {
          gte: firstDayOfPrevMonth
        }
      },
      select: {
        id: true,
        createdAt: true,
        live: true,
        paused: true,
        mailed: true,
        shared: true,
        message: {
          select: {
            createdAt: true,
            role: true,
            seen: true,
            message: true
          }
        },
        metadata: true
      }
    })

    // Calculate basic statistics
    const todayChats = chatRooms.filter(chat => 
      new Date(chat.createdAt).toDateString() === today.toDateString()
    ).length
    
    const yesterdayChats = chatRooms.filter(chat => 
      new Date(chat.createdAt).toDateString() === yesterday.toDateString()
    ).length
    
    const currentMonthChats = chatRooms.filter(chat => 
      new Date(chat.createdAt) >= firstDayOfMonth
    ).length
    
    const prevMonthChats = chatRooms.filter(chat => 
      new Date(chat.createdAt) >= firstDayOfPrevMonth &&
      new Date(chat.createdAt) <= lastDayOfPrevMonth
    ).length

    // Calculate active chats (those that are live or have recent messages)
    const activeChats = chatRooms.filter(chat => 
      chat.live || 
      chat.message?.some(m => 
        new Date(m.createdAt) >= new Date(Date.now() - 30 * 60 * 1000) // Active in last 30 minutes
      )
    ).length

    // Calculate average response time (in seconds)
    let totalResponseTime = 0
    let responseCount = 0
    chatRooms.forEach(chat => {
      if (chat.message && chat.message.length > 1) {
        for (let i = 1; i < chat.message.length; i++) {
          if (chat.message[i].role === 'assistant' && chat.message[i-1].role === 'user') {
            const responseTime = new Date(chat.message[i].createdAt).getTime() - 
                               new Date(chat.message[i-1].createdAt).getTime()
            totalResponseTime += responseTime
            responseCount++
          }
        }
      }
    })
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000) : 0

    // Calculate satisfaction rate based on metadata or message patterns
    const satisfiedChats = chatRooms.filter(chat => {
      // Check metadata for satisfaction flag if it exists
      if (chat.metadata && typeof chat.metadata === 'object') {
        const meta = chat.metadata as any
        if (meta.satisfied === true) return true
      }
      
      // Alternative: Check if the last user message was positive
      const lastUserMessage = chat.message?.reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        // Simple positive sentiment check (can be enhanced with more sophisticated analysis)
        const positiveKeywords = ['thanks', 'thank you', 'helpful', 'great', 'good', 'excellent']
        return positiveKeywords.some(keyword => 
          lastUserMessage.message.toLowerCase().includes(keyword)
        )
      }
      return false
    }).length
    
    const satisfactionRate = chatRooms.length > 0 ? 
      Math.round((satisfiedChats / chatRooms.length) * 100) : 0
    
    // Calculate monthly averages
    const prevMonthAvg = prevMonthChats / lastDayOfPrevMonth.getDate()
    const projectedMonthlyAvg = currentDay > 0 ? Math.round((currentMonthChats / currentDay) * daysInMonth) : 0

    return { 
      daily: todayChats, 
      monthly: currentMonthChats,
      prevDaily: yesterdayChats,
      monthlyAvg: Math.max(prevMonthAvg, projectedMonthlyAvg),
      activeChats,
      avgResponseTime,
      satisfactionRate
    }
  } catch (error) {
    console.error('Error getting chat stats:', error)
    return { 
      daily: 0, 
      monthly: 0, 
      prevDaily: 0, 
      monthlyAvg: 0,
      activeChats: 0,
      avgResponseTime: 0,
      satisfactionRate: 0
    }
  }
}

export const getMostAskedQuestions = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Get the user's DB record
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) return null;

    // Get all customer questions across user's domains
    const customerQuestions = await client.user.findUnique({
      where: { id: dbUser.id },
      select: {
        domains: {
          select: {
            customer: {
              select: {
                questions: {
                  select: {
                    question: true,
                  }
                }
              }
            }
          }
        },
        team: {
          select: {
            domains: {
              select: {
                customer: {
                  select: {
                    questions: {
                      select: {
                        question: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!customerQuestions) return null;

    // Extract all questions from personal domains
    const personalDomainQuestions = customerQuestions.domains.flatMap(domain => 
      domain.customer.flatMap(customer => 
        customer.questions.map(q => q.question)
      )
    );

    // Extract all questions from team domains (if user is in a team)
    const teamDomainQuestions = customerQuestions.team 
      ? customerQuestions.team.domains.flatMap(domain => 
          domain.customer.flatMap(customer => 
            customer.questions.map(q => q.question)
          )
        )
      : [];

    // Combine all questions
    const allQuestions = [...personalDomainQuestions, ...teamDomainQuestions];

    if (allQuestions.length === 0) return null;

    // Count occurrences of each question (case insensitive)
    const questionCounts = allQuestions.reduce((acc, question) => {
      const normalizedQuestion = question.toLowerCase().trim();
      acc[normalizedQuestion] = (acc[normalizedQuestion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort questions by frequency
    const sortedQuestions = Object.entries(questionCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([question, count]) => ({ 
        question, 
        count 
      }));

    // Return the top 5 most asked questions
    return sortedQuestions.slice(0, 5);
  } catch (error) {
    console.error("Error fetching most asked questions:", error);
    return null;
  }
}

export const getUnresolvedQuestions = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Get the user's DB record
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) return null;

    // Get all chat rooms with messages across the user's domains
    const chatRooms = await client.user.findUnique({
      where: { id: dbUser.id },
      select: {
        domains: {
          select: {
            customer: {
              select: {
                chatRoom: {
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
                        createdAt: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        team: {
          select: {
            domains: {
              select: {
                customer: {
                  select: {
                    chatRoom: {
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
                            createdAt: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!chatRooms) return null;

    // Process chat rooms from personal domains
    const personalChatRooms = chatRooms.domains.flatMap(domain => 
      domain.customer.flatMap(customer => 
        customer.chatRoom
      )
    );

    // Process chat rooms from team domains
    const teamChatRooms = chatRooms.team 
      ? chatRooms.team.domains.flatMap(domain => 
          domain.customer.flatMap(customer => 
            customer.chatRoom
          )
        )
      : [];

    // Combine all chat rooms
    const allChatRooms = [...personalChatRooms, ...teamChatRooms];

    // Identify unresolved questions
    const unresolvedQuestions: { question: string; count: number; date: Date }[] = [];
    
    // Keywords indicating a question was not resolved
    const unresolvedKeywords = [
      'speak to human', 'live support', 'talk to agent', 'talk to human', 
      'real person', 'connect with someone', 'help me', 'not working',
      'didn\'t work', 'doesn\'t work', 'cannot', 'can\'t', 'unable',
      'not helpful', 'confused', 'confusing', 'still not', 'no solution'
    ];

    allChatRooms.forEach(chatRoom => {
      if (!chatRoom.message || chatRoom.message.length === 0) return;
      
      // Check if live support was enabled for this chat
      const liveSupportEnabled = chatRoom.live || 
        chatRoom.message.some(msg => 
          msg.message.includes('Live support mode has been enabled')
        );
      
      // Look for user questions before live support was enabled, or questions with unresolved indicators
      let foundUnresolvedQuestions = false;
      
      for (let i = 0; i < chatRoom.message.length; i++) {
        const msg = chatRoom.message[i];
        if (msg.role !== 'user') continue;
        
        // If this is the last user message, or the next message indicates live support activation
        const isLastUserMessage = i === chatRoom.message.length - 1 || 
          (i + 1 < chatRoom.message.length && 
           chatRoom.message[i + 1].message.includes('Live support mode has been enabled'));
           
        // Check if the message contains any unresolved keywords
        const containsUnresolvedKeyword = unresolvedKeywords.some(keyword => 
          msg.message.toLowerCase().includes(keyword)
        );
        
        // If either:
        // 1. The message is followed by live support activation
        // 2. It's the last user message in a chat that has live support enabled
        // 3. It contains unresolved keywords
        if ((liveSupportEnabled && isLastUserMessage) || containsUnresolvedKeyword) {
          // Skip very short messages which are likely greetings
          if (msg.message.length < 8) continue;
          
          // Skip messages that are just emails
          if (msg.message.match(/^[^@]+@[^@]+\.[^@]+$/)) continue;
          
          // Skip generic live support requests
          if (msg.message.toLowerCase() === 'connect me to live support') continue;
          
          // Found a potential unresolved question
          foundUnresolvedQuestions = true;
          
          // Add to our list of unresolved questions
          const normalizedQuestion = msg.message.toLowerCase().trim();
          
          // Find if this question is already in our list
          const existingIndex = unresolvedQuestions.findIndex(q => 
            q.question.toLowerCase().trim() === normalizedQuestion
          );
          
          if (existingIndex >= 0) {
            // Increment count for existing question
            unresolvedQuestions[existingIndex].count++;
            // Update date if newer
            if (msg.createdAt > unresolvedQuestions[existingIndex].date) {
              unresolvedQuestions[existingIndex].date = msg.createdAt;
            }
          } else {
            // Add new question
            unresolvedQuestions.push({
              question: msg.message,
              count: 1,
              date: msg.createdAt
            });
          }
        }
      }
    });

    // Sort questions by count (most frequent first), then by recency
    const sortedQuestions = unresolvedQuestions
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.date.getTime() - a.date.getTime();
      })
      .map(({ question, count }) => ({ question, count }));

    // Return the top 5 unresolved questions
    return sortedQuestions.slice(0, 5);
  } catch (error) {
    console.error("Error fetching unresolved questions:", error);
    return null;
  }
}

export const getChatUsageByTime = async () => {
  try {
    const user = await currentUser();
    
    if (!user) {
      console.error("No user found");
      return null;
    }
    
    // Get the user's DB record
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });
    
    if (!dbUser) {
      console.error("Failed to get user from database");
      return null;
    }

    // Get all chat messages from the last 30 days for the current user
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Find chat messages from the last 30 days where the role is "user"
    // This captures when users sent messages to the chatbot
    const chatMessages = await client.chatMessage.findMany({
      where: {
        ChatRoom: {
          Customer: {
            Domain: {
              User: {
                clerkId: user.id
              }
            }
          }
        },
        role: "user",
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Initialize data structures to track usage by hour and day
    const hourlyUsage = Array(24).fill(0); // 24 hours
    const dailyUsage = Array(7).fill(0);   // 7 days of the week
    const hourlyUsageByDay = Array(7).fill(null).map(() => Array(24).fill(0)); // 7x24 grid for heatmap

    // Process each message
    chatMessages.forEach(message => {
      const date = new Date(message.createdAt);
      const hour = date.getHours();
      const day = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Increment counters
      hourlyUsage[hour]++;
      dailyUsage[day]++;
      hourlyUsageByDay[day][hour]++;
    });

    // Calculate the busiest hour
    let busiestHourIndex = 0;
    for (let i = 1; i < 24; i++) {
      if (hourlyUsage[i] > hourlyUsage[busiestHourIndex]) {
        busiestHourIndex = i;
      }
    }

    // Calculate the busiest day
    let busiestDayIndex = 0;
    for (let i = 1; i < 7; i++) {
      if (dailyUsage[i] > dailyUsage[busiestDayIndex]) {
        busiestDayIndex = i;
      }
    }

    // Find the busiest hour-day combination
    let busiestTimeHour = 0;
    let busiestTimeDay = 0;
    let maxCount = 0;
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        if (hourlyUsageByDay[day][hour] > maxCount) {
          maxCount = hourlyUsageByDay[day][hour];
          busiestTimeDay = day;
          busiestTimeHour = hour;
        }
      }
    }
    
    // Format the results
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Helper function to format hour to 12-hour format with AM/PM
    const formatHour = (hour: number) => {
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    };
    
    return {
      hourlyUsage,
      dailyUsage,
      hourlyUsageByDay,
      busiestHour: formatHour(busiestHourIndex),
      busiestDay: dayNames[busiestDayIndex],
      busiestTime: `${dayNames[busiestTimeDay]} at ${formatHour(busiestTimeHour)}`,
      totalMessages: chatMessages.length,
      dayNames
    };
  } catch (error) {
    console.error("Error fetching chat usage by time:", error);
    return null;
  }
}
