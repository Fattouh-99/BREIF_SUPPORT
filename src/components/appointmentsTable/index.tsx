'use client'

import React, { useState } from 'react'
import TabsMenu from '../tabs/intex'
import { SideSheet } from '../sheet'
import { Plus } from 'lucide-react'
import { CreateAppointmentForm } from './appointment-form'
import { TabsContent } from '../ui/tabs'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'
import Image from 'next/image'
import { getMonthName } from '@/lib/utils'
import { Switch } from '../ui/switch'
import { onToggleBookingStatus } from '@/actions/settings'

type Props = {
  bookings: {
    id: string
    name: string
    price: number
    image: string
    createdAt: Date
    domainId: string | null
    active: boolean
  }[]
  id: string
}

const AppointmentTable = ({ id, bookings: initialBookings }: Props) => {
  const [bookings, setBookings] = useState(initialBookings)

  const handleToggleStatus = async (bookingId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // Optimistically update the UI
      setBookings(prevBookings => {
        const updatedBookings = prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, active: newStatus }
            : booking
        );
        return updatedBookings;
      });

      const response = await onToggleBookingStatus(bookingId, newStatus);
      
      if (!response?.success) {
        setBookings(prevBookings => {
          const revertedBookings = prevBookings.map(booking =>
            booking.id === bookingId
              ? { ...booking, active: currentStatus }
              : booking
          );
          return revertedBookings;
        });
      } else {
        console.log('5. Server update successful, keeping optimistic update');
      }
      
    } catch (error) {
      console.error('Error in handleToggleStatus:', error);
      // Revert the change on error
      setBookings(prevBookings => {
        const revertedBookings = prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, active: currentStatus }
            : booking
        );
        console.log('Error recovery: Bookings after revert:', revertedBookings);
        return revertedBookings;
      });
    }
  }

  // Filter functions for the tabs
  const activeBookings = bookings.filter(p => p.active)
  const inactiveBookings = bookings.filter(p => !p.active)

  return (
    <div className="w-full">
      <div className="px-4 sm:px-0">
        <h2 className="font-bold text-2xl">Appointments</h2>
        <p className="text-sm font-light py-3">
          Add appointments to your store and set them live to accept payments from
          customers.
        </p>
      </div>
      <div className="flex flex-col w-full items-start gap-4 px-4 sm:px-0 mb-4 sm:mb-0">
        <div className="w-full sm:w-auto">
          <SideSheet
            description="Add appointments to your store and set them live to accept payments from customers."
            title="Add an appointment"
            className="flex items-center gap-2 border border-indigo-500 px-4 py-2 font-semibold rounded-lg text-sm w-full sm:w-auto hover:bg-gray-100"
            trigger={
              <>
                <Plus size={20} />
                <p>Add Appointment</p>
              </>
            }
          >
            <CreateAppointmentForm id={id} />
          </SideSheet>
        </div>
        <div className="w-full lg:w-[calc(50%-100px)]">
          <TabsMenu
            className="flex justify-between"
            triggers={[
              {
                label: 'All appointments',
              },
              { label: 'Active' },
              { label: 'Inactive' },
            ]}
          >
            <TabsContent className="pb-10" value="All appointments">
              <div className="overflow-x-auto">
                <DataTable headers={['Featured Image', 'Name', 'Pricing', 'Status', 'Created']}>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="min-w-[80px]">
                          <Image
                            src={`https://ucarecdn.com/${booking.image}/`}
                          width={50}
                          height={50}
                            alt={booking.name}
                            className="rounded-md object-cover"
                          />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <span className="line-clamp-2">{booking.name}</span>
                      </TableCell>
                      <TableCell className="min-w-[80px]">${booking.price}</TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={booking.active}
                            onCheckedChange={() => handleToggleStatus(booking.id, booking.active)}
                          />
                          <span className={`text-sm ${booking.active ? 'text-green-600' : 'text-gray-500'}`}>
                            {booking.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right min-w-[140px]">
                        <span className="whitespace-nowrap">
                          {booking.createdAt.getDate()}{' '}
                          {getMonthName(booking.createdAt.getMonth())}{' '}
                          {booking.createdAt.getFullYear()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </div>
            </TabsContent>
            <TabsContent value="Active">
              <div className="overflow-x-auto">
                <DataTable headers={['Featured Image', 'Name', 'Pricing', 'Status', 'Created']}>
                  {activeBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="min-w-[80px]">
                          <Image
                            src={`https://ucarecdn.com/${booking.image}/`}
                          width={50}
                          height={50}
                            alt={booking.name}
                            className="rounded-md object-cover"
                          />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <span className="line-clamp-2">{booking.name}</span>
                      </TableCell>
                      <TableCell className="min-w-[80px]">${booking.price}</TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={booking.active}
                            onCheckedChange={() => handleToggleStatus(booking.id, booking.active)}
                          />
                          <span className={`text-sm ${booking.active ? 'text-green-600' : 'text-gray-500'}`}>
                            {booking.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right min-w-[140px]">
                        <span className="whitespace-nowrap">
                          {booking.createdAt.getDate()}{' '}
                          {getMonthName(booking.createdAt.getMonth())}{' '}
                          {booking.createdAt.getFullYear()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </div>
            </TabsContent>
            <TabsContent value="Inactive">
              <div className="overflow-x-auto">
                <DataTable headers={['Featured Image', 'Name', 'Pricing', 'Status', 'Created']}>
                  {inactiveBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="min-w-[80px]">
                          <Image
                            src={`https://ucarecdn.com/${booking.image}/`}
                          width={50}
                          height={50}
                            alt={booking.name}
                            className="rounded-md object-cover"
                          />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <span className="line-clamp-2">{booking.name}</span>
                      </TableCell>
                      <TableCell className="min-w-[80px]">${booking.price}</TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={booking.active}
                            onCheckedChange={() => handleToggleStatus(booking.id, booking.active)}
                          />
                          <span className={`text-sm ${booking.active ? 'text-green-600' : 'text-gray-500'}`}>
                            {booking.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right min-w-[140px]">
                        <span className="whitespace-nowrap">
                          {booking.createdAt.getDate()}{' '}
                          {getMonthName(booking.createdAt.getMonth())}{' '}
                          {booking.createdAt.getFullYear()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </div>
            </TabsContent>
          </TabsMenu>
        </div>
      </div>
    </div>
  )
}

export default AppointmentTable
