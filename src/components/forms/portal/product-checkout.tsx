'use client'
import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useStripeCustomer } from '@/hooks/billing/use-billing'
import { Loader } from '@/components/loader'
import { Card } from '@/components/ui/card'
import { Elements } from '@stripe/react-stripe-js'
import Image from 'next/image'
import { CustomerPaymentForm } from './payment-form'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Initialize Stripe outside component - note this will need the stripeAccount parameter
// so we create a function that returns the initialized stripe object
const getStripePromise = (stripeAccount?: string) => {
  return loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!,
    stripeAccount ? { stripeAccount } : undefined
  )
}

type Props = {
  onBack(): void
  products?:
    | {
        name: string
        image: string
        images: string[]
        price: number
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
    | undefined
  amount?: number
  onNext(): void
  stripeId?: string
}

const PaymentCheckout = ({
  onBack,
  onNext,
  amount,
  products,
  stripeId,
}: Props) => {
  // Get the Stripe promise with the stripeId if available
  const stripePromise = getStripePromise(stripeId)
  const { stripeSecret, loadForm } = useStripeCustomer(amount!, stripeId!)

  return (
    <Loader loading={loadForm}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Complete Your Purchase
              </h1>
              <p className="text-gray-500 text-lg">
                Review your items and enter your payment details
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Product Details Section */}
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                  {products?.map((product, productIndex) => {
                    const [currentImageIndex, setCurrentImageIndex] = useState(0);
                    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
                    const allImages = product.images || [];
                    
                    const calculateTotalPrice = () => {
                      let total = parseFloat(product.price.toString());
                      if (product.variants) {
                        Object.entries(selectedVariants).forEach(([variantName, selectedValue]) => {
                          const variant = product.variants?.find(v => v.name === variantName);
                          const option = variant?.options.find(o => o.value === selectedValue);
                          if (option) {
                            total += option.priceAdjustment;
                          }
                        });
                      }
                      return total;
                    };

                    return (
                      <Card key={productIndex} className="overflow-hidden bg-white rounded-xl border-0 shadow-none">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Image Gallery */}
                          <div className="w-full md:w-1/2">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                              <Image
                                src={`https://ucarecdn.com/${currentImageIndex === 0 ? product.image : allImages[currentImageIndex - 1]}/`}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                              {allImages.length > 0 && (
                                <div className="absolute inset-0 flex items-center justify-between p-4">
                                  <button 
                                    onClick={() => setCurrentImageIndex(i => i === 0 ? allImages.length : i - 1)}
                                    className="rounded-full p-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                                  >
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                  </button>
                                  <button 
                                    onClick={() => setCurrentImageIndex(i => i === allImages.length ? 0 : i + 1)}
                                    className="rounded-full p-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                                  >
                                    <ChevronRight className="w-5 h-5 text-gray-700" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 0 && (
                              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                <button
                                  onClick={() => setCurrentImageIndex(0)}
                                  className={cn(
                                    "relative w-20 aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100",
                                    currentImageIndex === 0 && "ring-2 ring-gray-900"
                                  )}
                                >
                                  <Image
                                    src={`https://ucarecdn.com/${product.image}/`}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </button>
                                {allImages.map((img, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx + 1)}
                                    className={cn(
                                      "relative w-20 aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100",
                                      currentImageIndex === idx + 1 && "ring-2 ring-gray-900"
                                    )}
                                  >
                                    <Image
                                      src={`https://ucarecdn.com/${img}/`}
                                      alt={`${product.name} view ${idx + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="w-full md:w-1/2 space-y-6">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-gray-900">
                                  ${calculateTotalPrice().toFixed(2)}
                                </p>
                                {Object.keys(selectedVariants).length > 0 && (
                                  <p className="text-sm text-gray-500">Base price: ${parseFloat(product.price.toString()).toFixed(2)}</p>
                                )}
                              </div>
                            </div>

                            {/* Variants Selection */}
                            {product.variants && product.variants.length > 0 && (
                              <div className="space-y-6">
                                {product.variants.map((variant, variantIndex) => (
                                  <div key={variantIndex} className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                      {variant.name}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                      {variant.options.map((option, optionIndex) => {
                                        const isSelected = selectedVariants[variant.name] === option.value;
                                        const isAvailable = !variant.trackQuantity || (option.quantity && option.quantity > 0);
                                        
                                        return (
                                          <button
                                            key={optionIndex}
                                            onClick={() => setSelectedVariants(prev => ({
                                              ...prev,
                                              [variant.name]: option.value
                                            }))}
                                            disabled={!isAvailable}
                                            className={cn(
                                              "p-4 rounded-xl text-sm font-medium transition-all",
                                              isSelected
                                                ? "bg-gray-900 text-white border-2 border-gray-900"
                                                : isAvailable
                                                ? "bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-400"
                                                : "bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed",
                                            )}
                                          >
                                            <div className="flex flex-col gap-1">
                                              <span>{option.value}</span>
                                              <span className={cn(
                                                "text-xs",
                                                isSelected 
                                                  ? "text-gray-300"
                                                  : option.priceAdjustment > 0 
                                                  ? "text-gray-900" 
                                                  : option.priceAdjustment < 0 
                                                  ? "text-gray-700" 
                                                  : "text-gray-500"
                                              )}>
                                                {option.priceAdjustment > 0 && '+'}
                                                {option.priceAdjustment !== 0 && `$${option.priceAdjustment.toFixed(2)}`}
                                              </span>
                                              {variant.trackQuantity && (
                                                <span className={cn(
                                                  "text-xs",
                                                  isSelected ? "text-gray-300" : "text-gray-500"
                                                )}>
                                                  {option.quantity || 0} left
                                                </span>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Payment Section */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
                  {stripeSecret && stripePromise && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: stripeSecret,
                      }}
                    >
                      <CustomerPaymentForm onNext={onNext} />
                    </Elements>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Loader>
  )
}

export default PaymentCheckout
