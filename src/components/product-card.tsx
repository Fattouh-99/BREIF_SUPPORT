'use client';

import React from 'react'
import { motion } from 'framer-motion'
import { ImageIcon, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OptimizedImage } from '@/components/ui/optimized-image'

type ProductProps = {
  product: {
    id: string
    name: string
    price: number
    image: string
    description?: string | null
    productType?: string | null
    hasDiscount: boolean
    discountedPrice?: number | null
    active: boolean
  }
}

const ProductCard = ({ product }: ProductProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-square">
        {product.image ? (
          <OptimizedImage
            ucareId={product.image}
            alt={product.name}
            fill
            className="object-cover"
            fallbackIcon={<ImageIcon className="w-8 h-8 text-gray-400" />}
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
          <a
            href={`/product/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="mt-2 flex items-baseline gap-2">
          {product.hasDiscount && product.discountedPrice ? (
            <>
              <span className="text-lg font-bold text-green-600">
                ${product.discountedPrice}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ${product.price}
            </span>
          )}
          
          {product.productType && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              product.productType.toLowerCase() === 'new' && "bg-green-100 text-green-800",
              product.productType.toLowerCase() === 'sale' && "bg-red-100 text-red-800",
              product.productType.toLowerCase() === 'limited' && "bg-yellow-100 text-yellow-800"
            )}>
              {product.productType}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard 