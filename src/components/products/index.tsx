'use client'

import React, { useState, useEffect } from 'react'
import TabsMenu from '../tabs/intex'
import { SideSheet } from '../sheet'
import { Plus, Pen, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { CreateProductForm } from './product-form'
import { TabsContent } from '../ui/tabs'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'
import Image from 'next/image'
import { getMonthName, formatMoney, toNumber } from '@/lib/utils'
import { Switch } from '../ui/switch'
import { onToggleProductStatus, onDeleteProduct } from '@/actions/settings'
import { Button } from '../ui/button'
import { format } from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageIcon, PlusIcon, Settings2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { OptimizedImage } from '@/components/ui/optimized-image'
import LazyProductForm from './lazy-product-form'

type Props = {
  products: {
    id: string
    name: string
    price: number
    image: string
    createdAt: Date | string
    domainId: string | null
    active: boolean
    description?: string
    productType?: string
    hasDiscount: boolean
    discount?: number
    discountedPrice?: number
    images?: string[]
    variants?: {
      name: string
      options: {
        value: string
        priceAdjustment: number
        quantity?: number
      }[]
      trackQuantity: boolean
    }[]
  }[]
  id: string
}

const ProductTable = ({ id, products: initialProducts }: Props) => {  
  const [products, setProducts] = useState(initialProducts)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleEdit = (productId: string) => {
    setEditingProduct(productId)
    setIsSheetOpen(true)
  }

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      
      // Optimistically update the UI
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product =>
          product.id === productId
            ? { ...product, active: newStatus }
            : product
        )
        return updatedProducts
      })

      const response = await onToggleProductStatus(productId, newStatus)
      
      if (!response?.success) {
        // Only revert if the server update failed
        setProducts(prevProducts => {
          const revertedProducts = prevProducts.map(product =>
            product.id === productId
              ? { ...product, active: currentStatus }
              : product
          )
          return revertedProducts
        })
      }
      
    } catch (error) {
      console.error('Error in handleToggleStatus:', error)
      // Revert the change on error
      setProducts(prevProducts => {
        const revertedProducts = prevProducts.map(product =>
          product.id === productId
            ? { ...product, active: currentStatus }
            : product
        )
        return revertedProducts
      })
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      setIsDeleting(productId)
      
      // Optimistically update the UI
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId))

      const response = await onDeleteProduct(productId)
      
      if (!response?.success) {
        // Revert if the server update failed
        const deletedProduct = initialProducts.find(p => p.id === productId)
        if (deletedProduct) {
          setProducts(prevProducts => [...prevProducts, deletedProduct])
        }
      }
      
    } catch (error) {
      console.error('Error in handleDelete:', error)
      // Revert the change on error
      const deletedProduct = initialProducts.find(p => p.id === productId)
      if (deletedProduct) {
        setProducts(prevProducts => [...prevProducts, deletedProduct])
      }
    } finally {
      setIsDeleting(null)
    }
  }

  // Filter functions for the tabs
  const activeProducts = products.filter(p => p.active)
  const inactiveProducts = products.filter(p => !p.active)

  const renderProductRow = (product: Props['products'][0]) => {    
    return (
      <TableRow key={product.id}>
        <TableCell className="w-[100px]">
          <div className="relative w-16 h-16">
            <OptimizedImage
              ucareId={product.image}
              alt={product.name}
              fill
              className="rounded-lg object-cover"
              containerClassName="w-16 h-16"
              fallbackIcon={<div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>}
            />
            {product.images && product.images.length > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                +{product.images.length}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="min-w-[150px]">
          <div className="flex flex-col">
            <span className="font-medium text-sm">{product.name}</span>
            <span className="text-xs text-gray-500">{product.productType}</span>
          </div>
        </TableCell>
        <TableCell className="min-w-[150px]">
          {product.variants && product.variants.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {product.variants.map((variant, index) => (
                <div key={index} className="bg-gray-50 rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{variant.name}</span>
                    {variant.trackQuantity && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                        Quantity Tracked
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {variant.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className="flex flex-col bg-white p-2 rounded border border-gray-200"
                      >
                        <span className="text-sm text-gray-700">{option.value}</span>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {option.priceAdjustment ? (
                              <>
                                {option.priceAdjustment > 0 ? '+$' : '-$'}
                                {Math.abs(toNumber(option.priceAdjustment)).toFixed(2)}
                              </>
                            ) : '$0.00'}
                          </span>
                          {variant.trackQuantity && (
                            <span className="text-xs text-gray-500">
                              Stock: {option.quantity || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">No variants</span>
          )}
        </TableCell>
        <TableCell className="min-w-[200px] relative group">
          <span className="line-clamp-2 text-sm text-gray-600">
            {product.description || 'No description'}
          </span>
          {product.description && (
            <div className="absolute z-50 invisible group-hover:visible bg-white p-3 rounded-md shadow-lg border border-gray-200 max-w-[300px] mt-1">
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}
        </TableCell>
        <TableCell className="min-w-[120px]">
          <div className="flex flex-col">
            {product.hasDiscount ? (
              <>
                <span className="text-gray-500 line-through text-sm">
                  ${formatMoney(product.price)}
                </span>
                <span className="text-green-600 font-medium">
                  ${formatMoney(product.discountedPrice)}
                </span>
                <span className="text-xs text-indigo-600 font-medium">
                  -{product.discount}% off
                </span>
              </>
            ) : (
              <span className="text-gray-900 font-medium">
                ${formatMoney(product.price)}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="min-w-[120px]">
          <div className="flex items-center gap-2">
            <Switch
              checked={product.active}
              onCheckedChange={() => handleToggleStatus(product.id, product.active)}
            />
            <span className={`text-sm font-medium ${product.active ? 'text-green-600' : 'text-gray-500'}`}>
              {product.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </TableCell>
        <TableCell className="min-w-[140px]">
          <div className="text-right text-sm text-gray-500">
            <span className="whitespace-nowrap">
              {typeof product.createdAt === 'string' 
                ? new Date(product.createdAt).getDate()
                : product.createdAt.getDate()}{' '}
              {typeof product.createdAt === 'string'
                ? getMonthName(new Date(product.createdAt).getMonth())
                : getMonthName(product.createdAt.getMonth())}{' '}
              {typeof product.createdAt === 'string'
                ? new Date(product.createdAt).getFullYear()
                : product.createdAt.getFullYear()}
            </span>
          </div>
        </TableCell>
        <TableCell className="w-[100px]">
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(product.id)}
              className="hover:bg-gray-100"
            >
              <Pen className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(product.id)}
              disabled={isDeleting === product.id}
              className="hover:bg-red-100"
            >
              {isDeleting === product.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-500" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="w-full">
      <div className="px-4 sm:px-0">
        <h2 className="font-bold text-2xl">Products</h2>
        <p className="text-sm font-light py-3">
          Add products to your store and set them live to accept payments from
          customers.
        </p>
      </div>
      <div className="flex flex-col w-full items-start gap-4 px-4 sm:px-0 mb-4 sm:mb-0">
        <div className="w-full sm:w-auto">
          <SideSheet
            description="Add products to your store and set them live to accept payments from customers."
            title={editingProduct ? "Edit product" : "Add a product"}
            className="flex items-center gap-2 border border-indigo-500 px-4 py-2 font-semibold rounded-lg text-sm w-full sm:w-auto hover:bg-indigo-100"
            trigger={!editingProduct ? (
              <>
                <Plus size={20} />
                <p>Add Product</p>
              </>
            ) : undefined}
            open={isSheetOpen}
            onOpenChange={(open) => {
              setIsSheetOpen(open)
              if (!open) setEditingProduct(null)
            }}
          >
            <LazyProductForm id={id} editingProductId={editingProduct} />
          </SideSheet>
        </div>
        <div className="w-full">
          <TabsMenu
            className="flex justify-between"
            triggers={[
              { label: 'All products' },
              { label: 'Active' },
              { label: 'Inactive' },
            ]}
          >
            <TabsContent className="pb-10" value="All products">
              <div className="overflow-x-auto">
                <DataTable headers={['Featured Image', 'Name', 'Variants', 'Description', 'Pricing', 'Status', 'Created', 'Actions']}>
                  {products.map(renderProductRow)}
                </DataTable>
              </div>
            </TabsContent>
            <TabsContent value="Active">
              <div className="overflow-x-auto">
                <DataTable headers={['Featured Image', 'Name', 'Variants', 'Description', 'Pricing', 'Status', 'Created', 'Actions']}>
                  {activeProducts.map(renderProductRow)}
                </DataTable>
              </div>
            </TabsContent>
            <TabsContent value="Inactive">
              <div className="overflow-x-auto">
                <DataTable headers={['Featured Image', 'Name', 'Variants', 'Description', 'Pricing', 'Status', 'Created', 'Actions']}>
                  {inactiveProducts.map(renderProductRow)}
                </DataTable>
              </div>
            </TabsContent>
          </TabsMenu>
        </div>
      </div>
    </div>
  )
}

export default ProductTable
