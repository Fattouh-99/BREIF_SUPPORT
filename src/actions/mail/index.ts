'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { createMailTransporter, getMailFromAddress } from '@/lib/mailer'

export const onGetAllCustomers = async (id: string) => {
  try {
    const customers = await client.user.findUnique({
      where: {
        clerkId: id,
      },
      select: {
        subscription: {
          select: {
            credits: true,
            plan: true,
          },
        },
        domains: {
          select: {
            customer: {
              select: {
                id: true,
                email: true,
                Domain: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (customers) {
      return customers
    }
  } catch (error) {}
}

export const onGetAllCampaigns = async (id: string) => {
  try {
    const campaigns = await client.user.findUnique({
      where: {
        clerkId: id,
      },
      select: {
        campaign: {
          select: {
            name: true,
            id: true,
            customers: true,
            createdAt: true,
          },
        },
      },
    })

    if (campaigns) {
      return campaigns
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateMarketingCampaign = async (name: string) => {
  try {
    const user = await currentUser()
    if (!user) return null

    const campaign = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        campaign: {
          create: {
            name,
          },
        },
      },
    })

    if (campaign) {
      return { status: 200, message: 'You campaign was created' }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onSaveEmailTemplate = async (
  template: string,
  campainId: string
) => {
  try {
    const newTemplate = await client.campaign.update({
      where: {
        id: campainId,
      },
      data: {
        template,
      },
    })

    return { status: 200, message: 'Email template created' }
  } catch (error) {
    console.log(error)
  }
}

export const onAddCustomersToEmail = async (
  customers: string[],
  id: string
) => {
  try {
    // Get current campaign customers
    const campaign = await client.campaign.findUnique({
      where: { id },
      select: { customers: true }
    })

    if (!campaign) {
      return { status: 404, message: 'Campaign not found' }
    }

    // Combine existing and new customers, removing duplicates
    const updatedCustomers = Array.from(new Set([...campaign.customers, ...customers]))

    const customerAdd = await client.campaign.update({
      where: { id },
      data: {
        customers: updatedCustomers
      },
    })

    if (customerAdd) {
      return { status: 200, message: 'Customer added to campaign' }
    }

    return { status: 500, message: 'Failed to add customers to campaign' }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Failed to add customers to campaign' }
  }
}

export const onBulkMailer = async (email: string[], campaignId: string) => {
  try {
    const user = await currentUser()
    if (!user) return null

    // Get user's current credits
    const userCredits = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            credits: true
          }
        }
      }
    })

    // Check if user has enough credits
    if (!userCredits?.subscription?.credits || userCredits.subscription.credits < email.length) {
      return { 
        status: 400, 
        message: `Insufficient credits. You need ${email.length} credits but have ${userCredits?.subscription?.credits || 0} credits remaining.` 
      }
    }

    //get the template for this campaign
    const template = await client.campaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        name: true,
        template: true,
      },
    })

    if (template && template.template) {
      const transporter = createMailTransporter()

      const mailOptions = {
        from: getMailFromAddress(),
        to: email,
        subject: template.name,
        text: JSON.parse(template.template),
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          return { status: 200, message: 'Email sent' }
        }
      })

      const creditsUsed = await client.user.update({
        where: {
          clerkId: user.id,
        },
        data: {
          subscription: {
            update: {
              credits: { decrement: email.length },
            },
          },
        },
      })
      if (creditsUsed) {
        return { status: 200, message: 'Campaign emails sent' }
      }
    }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Failed to send campaign emails' }
  }
}

export const onGetAllCustomerResponses = async (id: string) => {
  try {
    const user = await currentUser()
    if (!user) return null
    const answers = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        domains: {
          select: {
            customer: {
              select: {
                questions: {
                  where: {
                    customerId: id,
                    answered: {
                      not: null,
                    },
                  },
                  select: {
                    question: true,
                    answered: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (answers) {
      return answers.domains
    }
  } catch (error) {
    console.log(error)
  }
}


export const onGetEmailTemplate = async (id: string) => {
  try {
    const template = await client.campaign.findUnique({
      where: {
        id,
      },
      select: {
        template: true,
      },
    });

    if (template) {
      return template.template;
    }
  } catch (error) {
    console.log(error);
  }
};

export const onRemoveCustomersFromCampaign = async (
  customerIds: string[],
  campaignId: string
) => {
  try {
    const user = await currentUser()
    if (!user) return null

    // Get current campaign customers
    const campaign = await client.campaign.findUnique({
      where: { id: campaignId },
      select: { customers: true }
    })

    if (!campaign) {
      return { status: 404, message: 'Campaign not found' }
    }

    // Create a Set of customers to remove for faster lookup
    const customersToRemove = new Set(customerIds)
    
    // Filter out the customers to be removed
    const updatedCustomers = campaign.customers.filter(
      customerId => !customersToRemove.has(customerId)
    )

    // Update campaign with remaining customers
    const updatedCampaign = await client.campaign.update({
      where: { id: campaignId },
      data: { 
        customers: {
          set: updatedCustomers
        }
      }
    })

    if (updatedCampaign) {
      return { 
        status: 200, 
        message: `Successfully removed ${customerIds.length} customer${customerIds.length === 1 ? '' : 's'} from the campaign` 
      }
    }

    return { status: 500, message: 'Failed to update campaign' }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Failed to remove customers from campaign' }
  }
}

export const onDeleteCampaign = async (campaignId: string) => {
  try {
    const user = await currentUser()
    if (!user) return null

    // Delete the campaign
    const deletedCampaign = await client.campaign.delete({
      where: { id: campaignId }
    })

    if (deletedCampaign) {
      return { 
        status: 200, 
        message: 'Campaign deleted successfully' 
      }
    }

    return { status: 500, message: 'Failed to delete campaign' }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Failed to delete campaign' }
  }
}
