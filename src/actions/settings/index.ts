'use server'
import { client } from '@/lib/prisma'
import { createClerkClient, currentUser } from '@clerk/nextjs/server'
import { pusherServer } from '@/lib/pusher'
import { Prisma, User, Domain, Billings, Team } from '@prisma/client'
import { Decimal } from 'decimal.js'

type DomainWithProducts = {
  domains: Array<{
    products: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
      active: boolean;
      createdAt: Date;
      hasDiscount: boolean;
      discount: number | null;
      discountedPrice: number | null;
      variants: string | null;
      domainId: string | null;
    }>;
  }>;
}

type ProductWithVariants = {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  description?: string | null;
  productType?: string | null;
  active: boolean;
  createdAt: Date;
  domainId: string | null;
  hasDiscount: boolean;
  discount: number | null;
  discountedPrice: number | null;
  variants: string | null;
}

type UserDomainResponse = {
  type: string;
  dashboard: 'services' | 'appointments' | 'both';
  subscription?: {
    plan: string;
  };
  role?: string;
  domains: Array<{
    id: string;
    name: string;
    icon: string;
    userId: string;
    teamId?: string;
    permissions?: any;
    accessUsers?: Array<{
      userId: string;
      permissions: {
        canModifyName: boolean;
        canModifyIcon: boolean;
        canModifyChat: boolean;
        canDelete: boolean;
      };
    }>;
    products?: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
      images?: string[];
      description?: string;
      productType?: string;
      active: boolean;
      createdAt: Date;
      domainId: string;
      hasDiscount: boolean;
      discount?: number;
      discountedPrice?: number;
      variants: any;
    }>;
    bookings: any[];
    chatBot: {
      id: string;
      welcomeMessage: string;
      icon: string | null;
      iconColor: string;
      iconStyle: string;
      background: string | null;
      textColor: string | null;
      themeColor: string | null;
      helpDeskColor: string | null;
      titleColor: string | null;
      customLinkTitle: string | null;
      customLinkDescription: string | null;
      customLinkUrl: string | null;
      customLinks: Array<{
        id: string;
        title: string;
        description: string | null;
        url: string;
        createdAt: Date;
      }>;
    };
  }>;
  personalDomains?: Array<{
    id: string;
    name: string;
    icon: string;
    teamId?: string;
    userId?: string;
    permissions?: any;
  }>;
  teamDomains?: Array<{
    id: string;
    name: string;
    icon: string;
    teamId?: string;
    userId?: string;
    permissions?: any;
  }>;
}

type ProductData = {
  name: string
  price: string
  image: string
  images?: string[]
  productType?: string | null
  description?: string | null
  hasDiscount?: boolean
  discount?: string
  discountedPrice?: string
  productUrl?: string
  variants?: {
    name: string
    options: {
      value: string
      priceAdjustment: number
      quantity?: number
    }[]
    trackQuantity: boolean
  }[]
}

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await currentUser()
  if (!user) {
    return {
      status: 401,
      message: 'Unauthorized',
    }
  }

  try {
    // First get the user's database ID and plan info
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { 
        domains: true,
        subscription: {
          select: {
            plan: true
          }
        },
        team: true
      }
    })

    if (!dbUser) {
      return {
        status: 404,
        message: 'User not found',
      }
    }

    // Check if domain already exists
    const whereCondition: Prisma.DomainWhereInput = {
      name: domain,
      OR: [
        { userId: dbUser.id },
        dbUser.team ? { teamId: dbUser.team.id } : undefined
      ].filter(Boolean) as Prisma.DomainWhereInput[]
    }

    const domainExists = await client.domain.findFirst({
      where: whereCondition
    })

    if (domainExists) {
      return {
        status: 400,
        message: 'Domain already exists',
      }
    }

    // Check domain limits based on plan
    const domainLimit = dbUser.subscription?.plan === 'pro' ? 10 : dbUser.subscription?.plan === 'standard' ? 1 : 1

    const userDomains = dbUser.domains || []
    if (userDomains.length >= domainLimit) {
      return {
        status: 403,
        message: 'Domain limit reached for your plan',
      }
    }

    // If we get here, we can create the domain
    const domainData: Prisma.DomainCreateInput = {
      name: domain,
      icon,
      User: { connect: { id: dbUser.id } },
      ...(dbUser.team && {
        team: { connect: { id: dbUser.team.id } }
      }),
      chatBot: {
        create: {
          welcomeMessage: 'Hey there, have a question? Text us here',
        },
      },
    }

    const newDomain = await client.domain.create({
      data: domainData
    })

    if (!newDomain) {
      return {
        status: 500,
        message: 'Failed to create domain',
      }
    }

    try {
      // Create the notification
      const notification = await client.notification.create({
        data: {
          type: 'DOMAIN_SETUP',
          message: `Please configure your new domain ${domain} by answering a few questions to help us personalize your chatbot.`,
          userId: dbUser.id,
          domainId: newDomain.id,
        },
      })

      // Trigger Pusher event for real-time notification
      const channelName = `user-${dbUser.id}`
      await pusherServer.trigger(channelName, 'notification', notification)
      
      return { 
        status: 200, 
        message: 'Domain successfully added' 
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      // Still return success even if notification fails
      return { 
        status: 200, 
        message: 'Domain added but notification failed' 
      }
    }
  } catch (error) {
    console.error('Error integrating domain:', error)
    return {
      status: 500,
      message: 'Failed to integrate domain',
    }
  }
}

export const onGetSubscriptionPlan = async () => {
  try {
    const user = await currentUser()
    if (!user) return 'STANDARD'
    
    const dbUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include: {
        subscription: true
      },
    })

    if (!dbUser) return 'STANDARD'

    // If no subscription found, create a default one
    if (!dbUser.subscription) {
      const defaultSubscription = await client.billings.create({
        data: {
          plan: 'standard',
          credits: 100,
          User: {
            connect: {
              id: dbUser.id
            }
          }
        },
      })
      // Map database plan name to frontend format
      const planMapping = {
        'standard': 'STANDARD',
        'pro': 'PRO'
      }
      return planMapping[defaultSubscription.plan as keyof typeof planMapping] || 'STANDARD'
    }

    // Map database plan names to frontend format
    const planMapping = {
      'standard': 'STANDARD',
      'pro': 'PRO'
    }
    
    const dbPlan = dbUser.subscription.plan || 'standard'
    return planMapping[dbPlan as keyof typeof planMapping] || 'STANDARD'
  } catch (error) {
    console.error('Error fetching subscription plan:', error)
    return 'STANDARD' // Default to STANDARD plan on error
  }
}

export const onGetAllAccountDomains = async () => {
  const user = await currentUser()
  if (!user) return
  try {
    const userData = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        fullname: true,
        dashboard: true,
        role: true,
        domains: {
          select: {
            id: true,
            name: true,
            icon: true,
            teamId: true,
            userId: true,
            permissions: true,
          },
        },
        team: {
          select: {
            domains: {
              select: {
                id: true,
                name: true,
                icon: true,
                teamId: true,
                userId: true,
                permissions: true,
              },
            },
          },
        },
      },
    })

    if (!userData) return null

    // Query all team domains that might have this user in the accessUsers array
    const accessibleDomains = await client.domain.findMany({
      where: {
        teamId: userData.team?.domains[0]?.teamId, // If user is in a team
        NOT: {
          userId: userData.id // Exclude domains already owned by this user
        }
      },
      select: {
        id: true,
        name: true,
        icon: true,
        teamId: true,
        userId: true,
        permissions: true,
      }
    });

    // Filter domains to find those where user has access via permissions
    const domainsWithAccess = accessibleDomains.filter(domain => {
      if (!domain.permissions) return false;
      
      try {
        const permissions = typeof domain.permissions === 'string' 
          ? JSON.parse(domain.permissions) 
          : domain.permissions;
          
        // Check if user is in the accessUsers array
        if (permissions.accessUsers && Array.isArray(permissions.accessUsers)) {
          return permissions.accessUsers.some((u: any) => u.userId === userData.id);
        }
      } catch (e) {
        console.error('Error parsing domain permissions:', e);
      }
      
      return false;
    });

    // Separate personal and team domains
    const personalDomains = userData.domains.filter(d => !d.teamId);
    
    // Team domains include:
    // 1. Domains that belong to the user's team
    // 2. Domains the user has access to via the accessUsers array
    const teamDomains = [
      ...(userData.domains.filter(d => d.teamId) || []),
      ...(userData.team?.domains || []),
      ...domainsWithAccess
    ];
    
    // Remove duplicates based on id
    const uniqueTeamDomains = Array.from(
      new Map(teamDomains.map(domain => [domain.id, domain])).values()
    );

    return { 
      ...userData,
      personalDomains,
      teamDomains: uniqueTeamDomains,
    }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    // Update in Clerk
    const clerk = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    await clerk.users.updateUser(user.id, {
      password
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: `Error updating password: ${error}` }
  }
}

export const onUpdateFullName = async (fullname: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    // Update in Clerk
    const clerk = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    
    // We still need to split the fullname for Clerk's firstName and lastName fields
    await clerk.users.updateUser(user.id, {
      firstName: fullname.split(' ')[0] || '',
      lastName: fullname.split(' ').slice(1).join(' ') || ''
    })

    // Update in our DB (only fullname)
    await client.user.update({
      where: { clerkId: user.id },
      data: {
        fullname
      }
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: `Error updating name: ${error}` }
  }
}

export const onGetUserProfile = async () => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    // Fetch user data from our database
    const userData = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        fullname: true,
        email: true,
        clerkId: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!userData) {
      throw new Error('User not found in database')
    }

    return { success: true, user: userData }
  } catch (error) {
    return { success: false, error: `Error fetching user profile: ${error}` }
  }
}

export const onUpdateEmail = async (email: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    // First check if email already exists in primary DB
    const existingUser = await client.user.findFirst({
      where: {
        email: email.toLowerCase(),
        NOT: {
          clerkId: user.id
        }
      }
    })

    if (existingUser) {
      return { success: false, error: 'Email already in use by another account' }
    }

    const clerk = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    
    // Check if this email already exists for the user
    const clerkUser = await clerk.users.getUser(user.id)
    
    // If email already exists for this user, don't add it again
    if (clerkUser.emailAddresses.some((e) => e.emailAddress === email.toLowerCase())) {
      return { success: true }
    }

    // Create the new email address with verified status for demo purposes
    await clerk.emailAddresses.createEmailAddress({
      userId: user.id,
      emailAddress: email.toLowerCase(),
      verified: true, // For demo purposes only
    })

    // Update in our DB
    await client.user.update({
      where: { clerkId: user.id },
      data: {
        email: email.toLowerCase()
      }
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: `Error updating email: ${error}` }
  }
}

export const onGetCurrentDomainInfo = async (domain: string) => {
  try {
    const user = await currentUser()
    if (!user) return null;
    
    // First try to find domain in user's own domains
    const userDomain = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        role: true,
        team: {
          select: {
            id: true,
          },
        },
        subscription: {
          select: {
            plan: true,
          },
        },
        domains: {
          where: {
            name: {
              contains: domain,
            },
          },
          select: {
            id: true,
            name: true,
            icon: true,
            userId: true,
            teamId: true,
            permissions: true,
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                description: true,
                productType: true,
                active: true,
                createdAt: true,
                domainId: true,
                hasDiscount: true,
                discount: true,
                discountedPrice: true,
                variants: true,
                images: true,
                updatedAt: true
              }
            },
            bookings: true,
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
            chatBot: {
              select: {
                id: true,
                welcomeMessage: true,
                icon: true,
                iconColor: true,
                iconStyle: true,
                background: true,
                textColor: true,
                themeColor: true,
                helpDeskColor: true,
                titleColor: true,
                homeTitle: true,
                homeLayout: true,
                helpdesk: true,
                paymentEnabled: true,
                chatbotEnabled: true,
                inquiryMode: true,
                productsEnabled: true,
                customLinksEnabled: true,
                popularTopicsEnabled: true,
                popularTopics: true,
                customLinkTitle: true,
                customLinkDescription: true,
                customLinkUrl: true,
                feedbackEnabled: true,
                feedbackQuestion: true,
                feedbackYesText: true,
                feedbackNoText: true,
                feedbackFollowUp: true,
                domainId: true,
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
                customLinks: true,
              },
            },
          },
        },
      },
    }) as (UserDomainResponse & { id: string, team?: { id: string } }) | null;

    // If domain not found in user's domains, check for team domains or domains shared with user
    if (!userDomain?.domains.length && userDomain?.id) {
      // Find domains where this user has access via the permissions.accessUsers array
      const sharedDomain = await client.domain.findFirst({
        where: {
          name: {
            contains: domain,
          },
          OR: [
            // Team domains
            userDomain.team ? { teamId: userDomain.team.id } : {},
            // Domains where user has access via permissions
            {
              NOT: { userId: userDomain.id },
            }
          ]
        },
        select: {
          id: true,
          name: true,
          icon: true,
          userId: true,
          teamId: true,
          permissions: true,
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              description: true,
              productType: true,
              active: true,
              createdAt: true,
              domainId: true,
              hasDiscount: true,
              discount: true,
              discountedPrice: true,
              variants: true,
              images: true,
              updatedAt: true
            }
          },
          bookings: true,
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
          chatBot: {
            select: {
              id: true,
              welcomeMessage: true,
              icon: true,
              iconColor: true,
              iconStyle: true,
              background: true,
              textColor: true,
              themeColor: true,
              helpDeskColor: true,
              titleColor: true,
              homeTitle: true,
              homeLayout: true,
              helpdesk: true,
              paymentEnabled: true,
              chatbotEnabled: true,
              inquiryMode: true,
              productsEnabled: true,
              customLinksEnabled: true,
              popularTopicsEnabled: true,
              popularTopics: true,
              customLinkTitle: true,
              customLinkDescription: true,
              customLinkUrl: true,
              feedbackEnabled: true,
              feedbackQuestion: true,
              feedbackYesText: true,
              feedbackNoText: true,
              feedbackFollowUp: true,
              domainId: true,
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
              customLinks: true,
            },
          },
        },
      });

      // If found a potentially shared domain, check user permissions
      if (sharedDomain && sharedDomain.permissions) {
        // Parse permissions if needed
        let permissionsObj: any = sharedDomain.permissions;
        if (typeof permissionsObj === 'string') {
          try {
            permissionsObj = JSON.parse(permissionsObj);
          } catch (e) {
            console.error('Error parsing permissions:', e);
            permissionsObj = {};
          }
        }

        // Check if user has access in accessUsers array
        if (permissionsObj.accessUsers && Array.isArray(permissionsObj.accessUsers)) {
          const hasAccess = permissionsObj.accessUsers.some((u: any) => u.userId === userDomain.id);
          
          if (hasAccess || sharedDomain.teamId === userDomain.team?.id) {
            // User has access, construct a response with this domain
            return {
              ...userDomain,
              domains: [sharedDomain]
            };
          }
        }
      }
    }

    if (userDomain && userDomain.domains.length > 0) {
      // Parse variants JSON for each product
      userDomain.domains.forEach(domain => {
        if (domain.products) {
          domain.products.forEach(product => {
            if (product.variants) {
              try {
                if (Array.isArray(product.variants)) {
                  product.variants = product.variants;
                } else if (typeof product.variants === 'string') {
                  const parsedVariants = JSON.parse(product.variants);
                  product.variants = parsedVariants;
                } else {
                  product.variants = null;
                }
              } catch (e) {
                console.error('Error handling variants for product', product.id, ':', e);
                product.variants = null;
              }
            }
          });
        }

        // Parse permissions if they exist
        if (domain.permissions && typeof domain.permissions === 'string') {
          try {
            domain.permissions = JSON.parse(domain.permissions);
          } catch (e) {
            console.error('Error parsing permissions:', e);
            domain.permissions = {
              canModifyName: true,
              canModifyIcon: true,
              canModifyChat: true,
              canDelete: true
            };
          }
        } else if (!domain.permissions) {
          // For solo users (no team), always grant full permissions
          domain.permissions = {
            canModifyName: true,
            canModifyIcon: true,
            canModifyChat: true,
            canDelete: true
          };
        }
      });
      return userDomain;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return null; // Return null instead of undefined
  }
}

export const onUpdateDomain = async (id: string, name: string) => {
  try {
    //check if domain with name exists
    const domainExists = await client.domain.findFirst({
      where: {
        name: {
          contains: name,
        },
      },
    })

    if (!domainExists) {
      const domain = await client.domain.update({
        where: {
          id,
        },
        data: {
          name,
        },
      })

      if (domain) {
        return {
          status: 200,
          message: 'Domain updated',
        }
      }

      return {
        status: 400,
        message: 'Oops something went wrong!',
      }
    }

    return {
      status: 400,
      message: 'Domain with this name already exists',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onChatBotImageUpdate = async (id: string, icon: string) => {
  const user = await currentUser()

  if (!user) return

  try {
    const domain = await client.domain.update({
      where: {
        id,
      },
      data: {
        chatBot: {
          update: {
            data: {
              icon,
            },
          },
        },
      },
    })

    if (domain) {
      return {
        status: 200,
        message: 'Domain updated',
      }
    }

    return {
      status: 400,
      message: 'Oops something went wrong!',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onDomainLogoUpdate = async (id: string, icon: string) => {
  const user = await currentUser()

  if (!user) return

  try {
    const domain = await client.domain.update({
      where: {
        id,
      },
      data: {
        icon,
      },
    })

    if (domain) {
      return {
        status: 200,
        message: 'Domain logo updated',
      }
    }

    return {
      status: 400,
      message: 'Oops something went wrong!',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdateWelcomeMessage = async (
  message: string,
  domainId: string
) => {
  try {
    const update = await client.domain.update({
      where: {
        id: domainId,
      },
      data: {
        chatBot: {
          update: {
            data: {
              welcomeMessage: message,
            },
          },
        },
      },
    })

    if (update) {
      return { status: 200, message: 'Welcome message updated' }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onDeleteUserDomain = async (id: string) => {
  const user = await currentUser()

  if (!user) return

  try {
    //first verify that domain belongs to user
    const validUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    })

    if (validUser) {
      //check that domain belongs to this user and delete
      const deletedDomain = await client.domain.delete({
        where: {
          userId: validUser.id,
          id,
        },
        select: {
          name: true,
        },
      })

      if (deletedDomain) {
        return {
          status: 200,
          message: `${deletedDomain.name} was deleted successfully`,
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateHelpDeskQuestion = async (
  id: string,
  data: {
    title: string
    question: string
  answer: string
    content?: string
    articleType: 'faq' | 'article' | 'guide'
    category?: string
    tags: string[]
    isPublished: boolean
    isPinned: boolean
  }
) => {
  try {
    const helpDeskQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        helpdesk: {
          create: {
            title: data.title,
            question: data.question,
            answer: data.answer,
            content: data.content,
            articleType: data.articleType,
            category: data.category,
            tags: data.tags,
            isPublished: data.isPublished,
            isPinned: data.isPinned,
          },
        },
      },
      include: {
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
        },
      },
    })

    if (helpDeskQuestion) {
      return {
        status: 200,
        message: 'New help desk article added',
        questions: helpDeskQuestion.helpdesk,
      }
    }

    return {
      status: 400,
      message: 'Oops! something went wrong',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetAllHelpDeskQuestions = async (id: string) => {
  try {
    const questions = await client.helpDesk.findMany({
      where: {
        domainId: id,
      },
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
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return {
      status: 200,
      message: 'Help desk articles retrieved',
      questions: questions,
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateFilterQuestions = async (
  id: string,
  question: string,
  answer: string
) => {
  try {
    const user = await currentUser()
    if (!user) {
      return {
        status: 401,
        message: 'Unauthorized',
      }
    }

    const created = await client.domain.update({
      where: {
        id,
      },
      data: {
        filterQuestions: {
          create: {
            question,
            answered: answer,
          },
        },
      },
      include: {
        filterQuestions: {
          select: {
            id: true,
            question: true,
            answered: true,
          },
        },
      },
    })

    if (created) {
      return {
        status: 200,
        message: 'Question created successfully',
        questions: created.filterQuestions,
      }
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: 'Something went wrong',
    }
  }
}

export const onGetAllFilterQuestions = async (id: string) => {
  try {
    const questions = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        filterQuestions: {
          select: {
            id: true,
            question: true,
            answered: true,
          },
        },
      },
    })

    if (questions) {
      return {
        status: 200,
        questions: questions.filterQuestions,
      }
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: 'Something went wrong',
    }
  }
}

export const onGetPaymentConnected = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const connected = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          stripeId: true,
        },
      })
      if (connected) {
        return connected.stripeId
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateNewDomainProduct = async (
  id: string,
  name: string,
  image: string,
  price: string
) => {
  try {
    const product = await client.domain.update({
      where: {
        id,
      },
      data: {
        products: {
          create: {
            name,
            image,
            price: parseFloat(price),
          },
        },
      },
    })

    if (product) {
      return {
        status: 200,
        message: 'Product successfully created',
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdateTheme = async (
  domainId: string,
  background?: string,
  textColor?: string,
  iconColor?: string,
  iconStyle?: string,
  themeColor?: string,
  helpDeskColor?: string,
  titleColor?: string,
  paymentEnabled?: boolean,
  customLinkTitle?: string,
  customLinkDescription?: string,
  customLinkUrl?: string,
  bubbleBackground?: string,
  homeTitle?: string,
  feedbackEnabled?: boolean,
  feedbackQuestion?: string,
  feedbackYesText?: string,
  feedbackNoText?: string,
  feedbackFollowUp?: string,
) => {
  try {
    // Create update data object without the potentially problematic field
    const updateData: any = {
      background,
      textColor,
      iconColor,
      iconStyle,
      themeColor,
      helpDeskColor,
      titleColor,
      paymentEnabled,
      customLinkTitle,
      customLinkDescription,
      customLinkUrl,
      homeTitle,
      feedbackEnabled,
      feedbackQuestion,
      feedbackYesText,
      feedbackNoText,
      feedbackFollowUp,
    };
    
    // Only add bubbleBackground if it's provided
    if (bubbleBackground !== undefined) {
      updateData.bubbleBackground = bubbleBackground;
    }

    // First check if domain exists
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: { chatBot: true }
    });

    if (!domain) {
      return {
        status: 404,
        message: 'Domain not found',
      };
    }

    let response;
    if (domain.chatBot) {
      // Update existing ChatBot
      response = await client.chatBot.update({
        where: {
          id: domain.chatBot.id,
        },
        data: updateData,
      });
    } else {
      // Create new ChatBot for the domain
      response = await client.chatBot.create({
        data: {
          ...updateData,
          domainId: domainId,
          welcomeMessage: 'Hey there, have a question? Text us here',
        },
      });
    }

    return {
      status: 200,
      message: 'Theme updated successfully',
      data: response,
    };
  } catch (error) {
    console.error('Error updating theme:', error);
    return {
      status: 500,
      message: 'Failed to update theme',
      error: error,
    };
  }
};

export const onUpdateInputMode = async (
  id: string,
) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id },
      select: { chatBot: { select: { id: true } } }
    });

    if (!domain?.chatBot?.id) {
      return {
        status: 404,
        message: 'ChatBot not found',
      }
    }
    
  } catch (error) {
    console.error('Input mode update error:', error)
    return {
      status: 500,
      message: 'Failed to update input mode',
    }
  }
}

export const onToggleProductStatus = async (id: string, active: boolean) => {
  try {    
    const product = await client.product.update({
      where: {
        id,
      },
      data: {
        active: active,
      }
    });

    // If we get here, the update was successful
    const response = {
      status: 200,
      success: true,
      message: `Product ${active ? 'activated' : 'deactivated'} successfully`,
    };
    
    return response;
    
  } catch (error) {
    console.error('Server: Error updating product status:', error);
    const errorResponse = {
      status: 500,
      success: false,
      message: 'Something went wrong',
    };
    console.log('Server: Sending error response:', errorResponse);
    return errorResponse;
  }
}

export const onCreateNewAppointmentSlot = async (
  id: string,
  name: string,
  image: string,
  price: string,
  appointmentType: string
) => {
  try {
    const booking = await client.domain.update({
      where: {
        id,
      },
      data: {
        bookings: {
          create: {
            name,
            image,
            price: parseInt(price),
            appointmentType,
            active: true,
            date: new Date(),
            slot: "default",
            email: "pending@example.com",
          },
        },
      },
    })

    if (booking) {
      return {
        status: 200,
        message: 'Booking slot successfully created',
      }
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      message: 'Failed to create booking slot',
    }
  }
}

export const onToggleBookingStatus = async (id: string, active: boolean) => {
  try {    
    const booking = await client.bookings.update({
      where: {
        id,
      },
      data: {
        active: active,
      }
    });
    
    return {
      status: 200,
      success: true,
      message: `Booking ${active ? 'activated' : 'deactivated'} successfully`,
    };
    
  } catch (error) {
    console.error('Server: Error updating booking status:', error);
    return {
      status: 500,
      success: false,
      message: 'Something went wrong',
    };
  }
}

export const onCreateProduct = async (
  domainId: string,
  productData: ProductData
) => {
  try {
    
    // Create initial product data
    const createData = {
      name: productData.name,
      price: parseFloat(productData.price),
      image: productData.image,
      ...(productData.productType && { productType: productData.productType }),
      ...(productData.description && { description: productData.description }),
      ...(productData.images && { images: productData.images }),
      ...(productData.variants && { variants: productData.variants }),
      ...(productData.productUrl && { productUrl: productData.productUrl }),
      active: true,
      Domain: {
        connect: {
          id: domainId,
        },
      },
      ...(productData.hasDiscount && {
        hasDiscount: true,
        discount: productData.discount ? parseInt(productData.discount) : null,
        discountedPrice: productData.discountedPrice ? parseFloat(productData.discountedPrice) : null,
      }),
    };


    // Create the product with all data at once
    const product = await client.product.create({
      data: createData,
    });
    
    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export const onUpdateProduct = async (
  productId: string,
  productData: ProductData
) => {
  try {
    console.log('Raw product data received for update:', productData);
    console.log('Product URL being updated:', productData.productUrl);
    
    const updateData = {
      name: productData.name,
      price: parseFloat(productData.price),
      ...(productData.image && { image: productData.image }),
      ...(productData.productType && { productType: productData.productType }),
      ...(productData.description && { description: productData.description }),
      ...(productData.images && { images: productData.images }),
      ...(productData.variants && { variants: productData.variants }),
      ...(productData.productUrl && { productUrl: productData.productUrl }),
      
      hasDiscount: productData.hasDiscount || false,
      ...(productData.hasDiscount && {
        discount: productData.discount ? parseInt(productData.discount) : null,
        discountedPrice: productData.discountedPrice ? parseFloat(productData.discountedPrice) : null,
      }),
      ...(!productData.hasDiscount && {
        discount: null,
        discountedPrice: null,
      }),
    };
    
    console.log('Update data being sent to database:', updateData);

    const product = await client.product.update({
      where: { id: productId },
      data: updateData,
    });
    
    console.log('Updated product response:', product);

    return { success: true, product };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export const onDeleteProduct = async (productId: string) => {
  try {
    
    const product = await client.product.delete({
      where: {
        id: productId,
      },
    });
    
    return {
      status: 200,
      success: true,
      message: 'Product deleted successfully',
    };
    
  } catch (error) {
    console.error('Server: Error deleting product:', error);
    return {
      status: 500,
      success: false,
      message: 'Failed to delete product',
    };
  }
}

export const onUpdatePaymentEnabled = async (id: string, enabled: boolean) => {
  try {
    // First get the chatBot id
    const domain = await client.domain.findUnique({
      where: { id },
      select: { chatBot: { select: { id: true } } }
    });

    if (!domain?.chatBot?.id) {
      return {
        status: 404,
        message: 'ChatBot not found',
      }
    }

    // Use raw SQL with proper type casting
    const result = await client.$executeRawUnsafe(
      `UPDATE "ChatBot" SET "paymentEnabled" = $1 WHERE id = $2::uuid`,
      enabled,
      domain.chatBot.id
    );

    if (result > 0) {
      return {
        status: 200,
        message: `Payment processing ${enabled ? 'enabled' : 'disabled'} successfully`,
      }
    }

    return {
      status: 500,
      message: 'Failed to update payment setting',
    }
  } catch (error) {
    console.error('Payment setting update error:', error)
    return {
      status: 500,
      message: 'Failed to update payment setting',
    }
  }
}

export const onUpdateChatbotMode = async (
  id: string,
  chatbotEnabled: boolean,
  inquiryMode: boolean
) => {
  try {
    // Find the chatBot id for this domain
    const domain = await client.domain.findUnique({
      where: { id },
      select: { chatBot: { select: { id: true } } }
    });

    if (!domain?.chatBot?.id) {
      return {
        status: 404,
        message: 'ChatBot not found',
      }
    }

    // Update the chatbot settings
    const chatBot = await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        chatbotEnabled,
        inquiryMode
      }
    });

    return {
      status: 200,
      message: 'Chatbot settings updated successfully',
      data: chatBot
    };
  } catch (error) {
    console.error('Error updating chatbot mode:', error);
    return {
      status: 500,
      message: 'Failed to update chatbot settings',
    }
  }
}

export const onUpdateProductsEnabled = async (id: string, productsEnabled: boolean) => {
  try {
    // Find the chatBot id for this domain
    const domain = await client.domain.findUnique({
      where: { id },
      select: { chatBot: { select: { id: true } } }
    });

    if (!domain?.chatBot?.id) {
      return {
        status: 404,
        message: 'ChatBot not found',
      }
    }

    // Update the products enabled setting
    const chatBot = await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        productsEnabled
      }
    });

    return {
      status: 200,
      message: `Products feature ${productsEnabled ? 'enabled' : 'disabled'} successfully`,
      data: chatBot
    };
  } catch (error) {
    console.error('Error updating products setting:', error);
    return {
      status: 500,
      message: 'Failed to update products setting',
    }
  }
}

export const onCreateCustomLink = async (
  domainId: string,
  title: string,
  description?: string,
  url?: string
) => {
  try {
    if (!title || !url) {
      return {
        status: 400,
        message: 'Title and URL are required',
      }
    }

    // First find the domain and its chatBot
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: { chatBot: true }
    });

    if (!domain) {
      return {
        status: 404,
        message: 'Domain not found',
      }
    }

    if (!domain.chatBot) {
      return {
        status: 404,
        message: 'ChatBot not found for this domain',
      }
    }

    const customLink = await client.customLink.create({
      data: {
        title,
        description,
        url,
        chatBotId: domain.chatBot.id,
      },
    })

    if (customLink) {
      return {
        status: 200,
        message: 'Custom link created successfully',
        data: customLink,
      }
    }
  } catch (error) {
    console.error('Error creating custom link:', error)
    return {
      status: 500,
      message: 'Failed to create custom link',
    }
  }
}

export const onUpdateCustomLink = async (
  customLinkId: string,
  title: string,
  description?: string,
  url?: string
) => {
  try {
    if (!title || !url) {
      return {
        status: 400,
        message: 'Title and URL are required',
      }
    }

    const customLink = await client.customLink.update({
      where: {
        id: customLinkId,
      },
      data: {
        title,
        description,
        url,
      },
    })

    return {
      status: 200,
      message: 'Custom link updated successfully',
      data: customLink,
    }
  } catch (error) {
    console.error('Error updating custom link:', error)
    return {
      status: 500,
      message: 'Failed to update custom link',
    }
  }
}

export const onDeleteCustomLink = async (customLinkId: string) => {
  try {
    await client.customLink.delete({
      where: {
        id: customLinkId,
      },
    })

    return {
      status: 200,
      message: 'Custom link deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting custom link:', error)
    return {
      status: 500,
      message: 'Failed to delete custom link',
    }
  }
}

export const onGetCustomLinks = async (chatBotId: string) => {
  try {
    const customLinks = await client.customLink.findMany({
      where: {
        chatBotId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return {
      status: 200,
      message: 'Custom links retrieved successfully',
      data: customLinks,
    }
  } catch (error) {
    console.error('Error getting custom links:', error)
    return {
      status: 500,
      message: 'Failed to get custom links',
    }
  }
}

export const onUpdatePopularTopics = async (
  domainId: string,
  topics: Array<{
    id: string
    title: string
    linkType: 'helpdesk_general' | 'helpdesk_specific' | 'external_url'
    linkTarget?: string
  }>
) => {
  try {
    console.log('onUpdatePopularTopics called with:', { domainId, topics })
    
    // First find the domain and its chatBot
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: { chatBot: true }
    });

    console.log('Domain found:', domain ? { id: domain.id, chatBotId: domain.chatBot?.id } : 'not found')

    if (!domain) {
      console.error('Domain not found for ID:', domainId)
      return {
        status: 404,
        message: 'Domain not found',
      }
    }

    if (!domain.chatBot) {
      console.error('ChatBot not found for domain:', domain.id)
      return {
        status: 404,
        message: 'ChatBot not found for this domain',
      }
    }

    const topicsJson = JSON.stringify(topics)
    console.log('Updating ChatBot with popular topics:', { chatBotId: domain.chatBot.id, topicsJson })

    // Update chatBot with popular topics (store as JSON)
    const chatBot = await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        popularTopics: topicsJson
      }
    });

    console.log('ChatBot updated successfully:', { chatBotId: chatBot.id, updatedPopularTopics: chatBot.popularTopics })

    return {
      status: 200,
      message: 'Popular topics updated successfully',
      data: topics,
    }
  } catch (error) {
    console.error('Error updating popular topics:', error)
    return {
      status: 500,
      message: 'Failed to update popular topics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const onUpdateFeatureToggles = async (
  domainId: string,
  features: {
    customLinksEnabled?: boolean
    popularTopicsEnabled?: boolean
  }
) => {
  try {
    // First find the domain and its chatBot
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: { chatBot: true }
    });

    if (!domain) {
      return {
        status: 404,
        message: 'Domain not found',
      }
    }

    if (!domain.chatBot) {
      return {
        status: 404,
        message: 'ChatBot not found for this domain',
      }
    }

    // Update chatBot with feature toggles
    const chatBot = await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        ...(features.customLinksEnabled !== undefined && { customLinksEnabled: features.customLinksEnabled }),
        ...(features.popularTopicsEnabled !== undefined && { popularTopicsEnabled: features.popularTopicsEnabled })
      }
    });

    return {
      status: 200,
      message: 'Feature toggles updated successfully',
      data: chatBot,
    }
  } catch (error) {
    console.error('Error updating feature toggles:', error)
    return {
      status: 500,
      message: 'Failed to update feature toggles',
    }
  }
}

export const onUpdateHomeLayout = async (
  domainId: string,
  homeLayout: string
) => {
  try {
    // First find the domain and its chatBot
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: { chatBot: true }
    });

    if (!domain) {
      return {
        status: 404,
        message: 'Domain not found',
      }
    }

    if (!domain.chatBot) {
      return {
        status: 404,
        message: 'ChatBot not found for this domain',
      }
    }

    // Update chatBot with home layout
    const chatBot = await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        homeLayout
      }
    });

    return {
      status: 200,
      message: `Home layout updated to ${homeLayout} successfully`,
      data: chatBot,
    }
  } catch (error) {
    console.error('Error updating home layout:', error)
    return {
      status: 500,
      message: 'Failed to update home layout',
    }
  }
}
