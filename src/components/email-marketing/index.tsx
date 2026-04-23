'use client'
import { useEmailMarketing } from '@/hooks/email-marketing/use-marketing'
import React from 'react'
import { CustomerTable } from './customer-table'
import { Button } from '../ui/button'
import { Plus, X, Trash, UserMinus, Trash2, Pencil, Send } from 'lucide-react'
import Modal from '../mondal'
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Loader } from '../loader'
import FormGenerator from '../forms/form-generator'
import { cn, getMonthName } from '@/lib/utils'
import CalIcon from '@/icons/cal-icon'
import PersonIcon from '@/icons/person-icon'
import { EditEmail } from './edit-email'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

type Props = {
  domains: {
    customer: {
      Domain: {
        name: string
      } | null
      id: string
      email: string | null
    }[]
  }[]
  campaign: {
    name: string
    id: string
    customers: string[]
    createdAt: Date
  }[]
  subscription: {
    plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
    credits: number
  } | null
}

const EmailMarketing = ({ campaign, domains, subscription }: Props) => {
  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([])
  const [selectedCampaignForRemoval, setSelectedCampaignForRemoval] = React.useState<string>('')
  const [campaignToDelete, setCampaignToDelete] = React.useState<string>('')
  const [addSearchTerm, setAddSearchTerm] = React.useState('')
  const [removeSearchTerm, setRemoveSearchTerm] = React.useState('')

  const {
    onSelectedEmails,
    isSelected,
    onCreateCampaign,
    register,
    errors,
    loading,
    processing,
    onAddCustomersToCampaign,
    onBulkEmail,
    onSetAnswersId,
    isId,
    registerEmail,
    emailErrors,
    onCreateEmailTemplate,
    setValue,
    onRemoveCustomersFromCampaign,
    onDeleteCampaignHandler,
  } = useEmailMarketing()

  const handleSelectAllCustomers = (campaignId: string) => {
    const currentCampaign = campaign.find(c => c.id === campaignId)
    if (currentCampaign) {
      if (selectedCustomers.length === currentCampaign.customers.length) {
        setSelectedCustomers([])
      } else {
        setSelectedCustomers(currentCampaign.customers)
      }
    }
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId)
      }
      return [...prev, customerId]
    })
  }

  const handleRemoveCustomers = async () => {
    if (selectedCampaignForRemoval && selectedCustomers.length > 0) {
      await onRemoveCustomersFromCampaign(selectedCustomers, selectedCampaignForRemoval)
      setSelectedCustomers([])
      setSelectedCampaignForRemoval('')
    }
  }

  const handleDeleteCampaign = async () => {
    if (campaignToDelete) {
      await onDeleteCampaignHandler(campaignToDelete)
      setCampaignToDelete('')
    }
  }

  return (
    <div className="w-full flex-1 h-0 grid grid-cols-1 lg:grid-cols-2 gap-5 p-4">
      <CustomerTable
        domains={domains}
        onId={onSetAnswersId}
        onSelect={onSelectedEmails}
        select={isSelected}
        id={isId}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 justify-end">
          <Modal
            title="Create a new campaign"
            description="Add your customers and create a marketing campaign"
            trigger={
              <Card className="flex gap-2 items-center px-3 cursor-pointer text-sm bg-indigo-50 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:border-indigo-800 dark:text-indigo-100">
                <Loader loading={false}>
                  <Plus className="w-4 h-4" /> Create Campaign
                </Loader>
              </Card>
            }
          >
            <form
              className="flex flex-col gap-4"
              onSubmit={onCreateCampaign}
            >
              <FormGenerator
                name="name"
                register={register}
                errors={errors}
                inputType="input"
                placeholder="your campaign name"
                type="text"
              />
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
                type="submit"
              >
                <Loader loading={loading}><span className="text-white">Create Campaign</span></Loader>
              </Button>
            </form>
          </Modal>
          <Card className="p-2 bg-indigo-50 border-indigo-200">
            <CardDescription className="font-bold text-indigo-700">
              {subscription?.credits} credits
            </CardDescription>
          </Card>
        </div>
        <div className="flex flex-col items-end mt-2 gap-3 overflow-x-auto w-full">
          {campaign &&
            campaign.map((camp, i) => (
              <Card
                key={camp.id}
                className={cn(
                  'p-4 w-full sm:min-w-[300px] lg:min-w-[500px] cursor-pointer transition-all',
                )}
              >
                <Loader loading={processing}>
                  <CardContent className="p-0 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-2">
                      <div className="flex gap-2 items-center">
                        <CalIcon />
                        <CardDescription className="text-sm">
                          Created {getMonthName(camp.createdAt.getMonth())}{' '}
                          {camp.createdAt.getDate()}th
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <PersonIcon />
                        <CardDescription className="text-sm">
                          {camp.customers.length} customers added
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3">
                      <CardTitle className="text-lg text-indigo-900">{camp.name}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                          <Modal
                            title="Add Customers"
                            description="Select customers to add to this campaign"
                            trigger={
                              <Card className="rounded-lg cursor-pointer bg-indigo-600 py-[11px] px-4 font-semibold text-sm hover:bg-indigo-700 text-white">
                                <Plus className="w-4 h-4" />
                              </Card>
                            }
                          >
                            <div className="flex flex-col gap-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search customers..."
                                  className="w-full px-3 py-2 border rounded-md"
                                  value={addSearchTerm}
                                  onChange={(e) => setAddSearchTerm(e.target.value.toLowerCase())}
                                />
                              </div>
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {domains.flatMap(d => d.customer)
                                  // Filter out customers that are already in the campaign
                                  .filter(customer => !camp.customers.includes(customer.id))
                                  // Filter based on search term
                                  .filter(customer => 
                                    customer.email?.toLowerCase().includes(addSearchTerm)
                                  )
                                  .map((customer) => (
                                    <div key={customer.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`add-${customer.id}`}
                                        checked={isSelected.includes(customer.id)}
                                        onCheckedChange={() => onSelectedEmails(customer.id)}
                                      />
                                      <Label htmlFor={`add-${customer.id}`}>
                                        {customer.email}
                                      </Label>
                                    </div>
                                  ))}
                              </div>
                              <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={isSelected.length === 0 || processing}
                                onClick={async () => {
                                  await onAddCustomersToCampaign(camp.id);
                                }}
                              >
                                <Loader loading={processing}>
                                  Add Selected Customers ({isSelected.length})
                                </Loader>
                              </Button>
                            </div>
                          </Modal>
                          <Modal
                            title="Edit Email"
                            description="This email will be sent to campaign members"
                            trigger={
                              <Card className="rounded-lg cursor-pointer bg-indigo-600 py-[11px] px-4 font-semibold text-sm hover:bg-indigo-700 text-white">
                                <Pencil className="w-4 h-4" />
                              </Card>
                            }
                          >
                            <EditEmail
                              register={registerEmail}
                              errors={emailErrors}
                              setDefault={setValue}
                              id={camp.id}
                              onCreate={onCreateEmailTemplate}
                            />
                          </Modal>
                          <Modal
                            title="Remove Customers"
                            description="Select customers to remove from the campaign"
                            trigger={
                              <Button
                                variant="destructive"
                                className="rounded-lg text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCampaignForRemoval(camp.id);
                                  setSelectedCustomers([]);
                                }}
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            }
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex justify-between items-center">
                                <Label>Select Customers</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentCampaign = campaign.find(c => c.id === camp.id);
                                    if (currentCampaign) {
                                      if (selectedCustomers.length === currentCampaign.customers.length) {
                                        setSelectedCustomers([]);
                                      } else {
                                        setSelectedCustomers([...currentCampaign.customers]);
                                      }
                                    }
                                  }}
                                >
                                  {selectedCustomers.length === camp.customers.length 
                                    ? 'Deselect All' 
                                    : 'Select All'
                                  }
                                </Button>
                              </div>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search customers..."
                                  className="w-full px-3 py-2 border rounded-md"
                                  value={removeSearchTerm}
                                  onChange={(e) => setRemoveSearchTerm(e.target.value.toLowerCase())}
                                />
                              </div>
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {camp.customers
                                  .filter(customerId => {
                                    const customerDetails = domains.flatMap(d => 
                                      d.customer.find(c => c.id === customerId)
                                    ).find(Boolean);
                                    return customerDetails?.email?.toLowerCase().includes(removeSearchTerm);
                                  })
                                  .map((customerId) => {
                                    const customerDetails = domains.flatMap(d => 
                                      d.customer.find(c => c.id === customerId)
                                    ).find(Boolean);
                                    
                                    return (
                                      <div key={customerId} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`remove-${customerId}`}
                                          checked={selectedCustomers.includes(customerId)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedCustomers(prev => [...prev, customerId]);
                                            } else {
                                              setSelectedCustomers(prev => prev.filter(id => id !== customerId));
                                            }
                                          }}
                                        />
                                        <Label htmlFor={`remove-${customerId}`}>
                                          {customerDetails?.email || customerId}
                                        </Label>
                                      </div>
                                    );
                                  })}
                              </div>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  try {
                                    if (selectedCustomers.length > 0) {
                                      await onRemoveCustomersFromCampaign(selectedCustomers, camp.id);
                                      setSelectedCustomers([]);
                                    }
                                  } catch (error) {
                                    console.error('Error removing customers:', error);
                                  }
                                }}
                                disabled={selectedCustomers.length === 0 || processing}
                              >
                                <Loader loading={processing}>
                                  <Trash className="w-4 h-4 mr-1" />
                                  Remove Selected Customers ({selectedCustomers.length})
                                </Loader>
                              </Button>
                            </div>
                          </Modal>
                          <Modal
                            title="Delete Campaign"
                            description="Are you sure you want to delete this campaign? This action cannot be undone."
                            trigger={
                              <Button
                                variant="destructive"
                                className="rounded-lg text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCampaignToDelete(camp.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            }
                          >
                            <div className="flex flex-col gap-4">
                              <p className="text-sm text-gray-500">
                                This will permanently delete the campaign "{camp.name}" and remove all associated data.
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setCampaignToDelete('')}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDeleteCampaign}
                                  disabled={processing}
                                >
                                  <Loader loading={processing}>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete Campaign
                                  </Loader>
                                </Button>
                              </div>
                            </div>
                          </Modal>
                              <Button
                                variant="default"
                                className="rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBulkEmail(
                                    campaign[i].customers.map((c) => c),
                                    camp.id
                                  )
                                }}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                      </div>
                    </div>
                  </CardContent>
                </Loader>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}

export default EmailMarketing
