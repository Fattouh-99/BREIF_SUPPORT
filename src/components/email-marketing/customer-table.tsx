'use client'
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Card, CardDescription } from '../ui/card'

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
  onSelect: (email: string) => void
  select: string[]
  onId: (id: string) => void
  id: string | undefined
}

export const CustomerTable = ({ domains, onSelect, select, onId, id }: Props) => {
  const [searchTerm, setSearchTerm] = React.useState('')

  // Calculate total customers
  const totalCustomers = domains.reduce((total, domain) => 
    total + domain.customer.length, 0
  )

  // Get filtered customers count
  const filteredCustomers = domains.flatMap(domain => 
    domain.customer.filter(customer => 
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.Domain?.name.toLowerCase().includes(searchTerm)
    )
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full px-3 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
        <Card className="ml-4 p-2 bg-indigo-50 border-indigo-200">
          <CardDescription className="font-bold text-indigo-700">
            {searchTerm ? `${filteredCustomers.length} / ` : ''}{totalCustomers} customers
          </CardDescription>
        </Card>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Domain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.flatMap((domain) =>
              domain.customer
                .filter(customer => 
                  customer.email?.toLowerCase().includes(searchTerm) ||
                  customer.Domain?.name.toLowerCase().includes(searchTerm)
                )
                .map((customer) => (
                  <TableRow
                    key={customer.id}
                    className={cn(
                      'hover:bg-gray-50',
                      id === customer.id ? 'bg-indigo-50' : ''
                    )}
                    onClick={() => onId(customer.id)}
                  >
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.Domain?.name}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
