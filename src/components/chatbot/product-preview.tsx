import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import Image from 'next/image';
import { Button } from '../ui/button';
import { ShoppingCart, ImageIcon } from 'lucide-react';

type ProductPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    description?: string | null;
    image?: string;
    hasDiscount: boolean;
    discountedPrice?: number | null;
    productType?: string | null;
    active: boolean;
    productUrl?: string | null;
  } | null;
};

const ProductPreview = ({ isOpen, onClose, product }: ProductPreviewProps) => {
  if (!product) return null;
  
  // Debug log to inspect the product object
  console.log('Product in preview:', product);
  console.log('Product URL:', product.productUrl);
  console.log('Product URL type:', typeof product.productUrl);
  
  // Handle undefined, null or empty string cases
  const hasValidUrl = Boolean(product.productUrl && product.productUrl.trim() !== '');
  console.log('Has valid URL:', hasValidUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {product.image ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={product.image.includes('https://ucarecdn.com/') ? product.image : `https://ucarecdn.com/${product.image}/`}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {product.hasDiscount && product.discountedPrice ? (
                    <>
                      <span className="text-green-600">${product.discountedPrice}</span>
                      <span className="ml-2 text-sm line-through text-gray-400">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span>${product.price}</span>
                  )}
                </p>
                {product.productType && (
                  <p className="text-sm text-gray-500">Type: {product.productType}</p>
                )}
              </div>
              {hasValidUrl ? (
                <Button 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  onClick={() => window.open(product.productUrl || '#', '_blank')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              ) : (
                <p className="text-xs text-gray-500 italic">Contact us for purchase information</p>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-gray-600">{product.description}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPreview; 