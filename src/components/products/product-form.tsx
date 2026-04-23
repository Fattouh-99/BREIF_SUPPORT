'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ErrorMessage } from '@hookform/error-message'
import { Loader } from '@/components/loader'
import FormGenerator from '../forms/form-generator'
import { UploadIcon, PlusCircle, Trash2, X } from 'lucide-react'
import { useProducts } from '@/hooks/settings/use-settings'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { OptimizedImage } from '@/components/ui/optimized-image'

type VariantOption = {
  value: string
  priceAdjustment: number
  quantity?: number
}

type Variant = {
  name: string
  options: VariantOption[]
  trackQuantity: boolean
}

type AddProductProps = {
  name: string;
  images: any;
  additionalImages: any;
  price: string;
  productType: string;
  description: string;
  hasDiscount: boolean;
  discount: string;
  discountedPrice: string;
  variants: Variant[];
  productUrl?: string;
}

type CreateProductFormProps = {
  id: string
  editingProductId?: string | null
}

export const CreateProductForm = ({ id, editingProductId }: CreateProductFormProps) => {
  const { onCreateNewProduct, register, errors, loading, setValue, watch } = useProducts(id, editingProductId)
  const hasDiscount = watch('hasDiscount', false)
  const price = watch('price')
  const discount = watch('discount')
  const existingImage = watch('existingImage')
  const existingAdditionalImages = watch('existingAdditionalImages')
  const [variants, setVariants] = useState<Variant[]>([])

  // Update form value when variants change
  useEffect(() => {
    // Only include non-empty variants
    const validVariants = variants.filter(v => v.name && v.options.some(o => o))
    setValue('variants', validVariants)
  }, [variants, setValue])

  const handleDiscountToggle = (checked: boolean) => {
    setValue('hasDiscount', checked)
    if (!checked) {
      setValue('discount', '')
      setValue('discountedPrice', '')
    }
  }

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: '',
        options: [{ value: '', priceAdjustment: 0, quantity: 0 }],
        trackQuantity: false
      }
    ])
  }

  const removeVariant = (index: number) => {
    const newVariants = [...variants]
    newVariants.splice(index, 1)
    setVariants(newVariants)
  }

  const updateVariantName = (index: number, name: string) => {
    const newVariants = [...variants]
    newVariants[index].name = name
    setVariants(newVariants)
  }

  const toggleQuantityTracking = (variantIndex: number) => {
    const newVariants = [...variants]
    newVariants[variantIndex].trackQuantity = !newVariants[variantIndex].trackQuantity
    setVariants(newVariants)
  }

  const addVariantOption = (variantIndex: number) => {
    const newVariants = [...variants]
    newVariants[variantIndex].options.push({ 
      value: '', 
      priceAdjustment: 0,
      quantity: 0 
    })
    setVariants(newVariants)
  }

  const updateVariantOption = (variantIndex: number, optionIndex: number, field: keyof VariantOption, value: string) => {
    const newVariants = [...variants]
    if (field === 'priceAdjustment' || field === 'quantity') {
      const numValue = Number(value)
      newVariants[variantIndex].options[optionIndex][field] = isNaN(numValue) ? 0 : numValue
    } else {
      newVariants[variantIndex].options[optionIndex][field] = value
    }
    setVariants(newVariants)
  }

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const newVariants = [...variants]
    newVariants[variantIndex].options.splice(optionIndex, 1)
    setVariants(newVariants)
  }

  // Calculate discounted price when price or discount changes
  useEffect(() => {
    if (hasDiscount && price && discount) {
      const priceNum = parseFloat(price)
      const discountNum = parseInt(discount)
      if (!isNaN(priceNum) && !isNaN(discountNum)) {
        const discountedPrice = priceNum - (priceNum * discountNum / 100)
        setValue('discountedPrice', discountedPrice.toFixed(2))
      }
    }
  }, [hasDiscount, price, discount, setValue])

  // Load existing variants if editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (editingProductId) {
        try {
          const response = await fetch(`/api/products/${editingProductId}`)
          const product = await response.json()
          if (product.variants) {
            const parsedVariants = JSON.parse(product.variants)
            // Ensure all numeric fields are properly initialized
            const normalizedVariants = parsedVariants.map((variant: Variant) => ({
              ...variant,
              options: variant.options.map(opt => ({
                value: opt.value || '',
                priceAdjustment: Number(opt.priceAdjustment) || 0,
                quantity: Number(opt.quantity) || 0
              }))
            }))
            setVariants(normalizedVariants)
          }
        } catch (error) {
          console.error('Error loading variants:', error)
        }
      }
    }
    fetchProduct()
  }, [editingProductId])

  return (
    <div className="max-h-[80vh] overflow-y-auto px-4">
      <form
        className="mt-3 w-full flex flex-col gap-5 py-10"
        onSubmit={onCreateNewProduct}
      >
        <FormGenerator
          inputType="input"
          register={register}
          label="Product Name:"
          name="name"
          errors={errors}
          placeholder="Your product name"
          type="text"
        />

        <FormGenerator
          inputType="select"
          register={register}
          label="Select Product Type:"
          name="productType"
          errors={errors}
          type="text"
          placeholder="Select product type"
          options={[
            { value: 'physical', label: 'Physical Product', id: 'physical' },
            { value: 'service', label: 'Service', id: 'service' },
            { value: 'digital', label: 'Digital Product', id: 'digital' },
            { value: 'subscription', label: 'Subscription', id: 'subscription' },
          ]}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Product Description:</Label>
          <Textarea
            {...register('description')}
            id="description"
            placeholder="Describe your product..."
            className="min-h-[100px] resize-y"
          />
          <ErrorMessage
            errors={errors}
            name="description"
            render={({ message }) => (
              <p className="text-red-400 text-sm">{message}</p>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="productUrl">Product URL (optional):</Label>
          <Input
            {...register('productUrl')}
            id="productUrl"
            placeholder="https://example.com/product-page"
            type="url"
          />
          <p className="text-xs text-gray-500">
            Add a link to your product page. This is where customers will be directed when they click "Buy Now".
          </p>
          <ErrorMessage
            errors={errors}
            name="productUrl"
            render={({ message }) => (
              <p className="text-red-400 text-sm">{message}</p>
            )}
          />
        </div>

        <div className="flex flex-col items-start">
          <p className="text-sm font-semibold mb-1">Product Images:</p>
          <div className="flex flex-col gap-4">
            {/* Cover Image Section */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Cover Image (Main product image)</p>
              <div className="flex flex-wrap gap-2">
                <Label
                  htmlFor="upload-product"
                  className="flex gap-1 p-2 rounded-lg border border-indigo-500 text-indigo-500 cursor-pointer text-sm items-center"
                >
                  <Input
                    {...register('images')}
                    className="hidden"
                    type="file"
                    id="upload-product"
                    accept="image/png,image/jpeg,image/jpg"
                  />
                  <UploadIcon />
                  {existingImage ? 'Change Cover' : 'Upload Cover'}
                </Label>
                {existingImage && (
                  <div className="relative">
                    <OptimizedImage
                      ucareId={existingImage}
                      alt="Existing Cover"
                      containerClassName="w-20 h-20"
                      className="rounded-lg object-cover"
                    />
                    <span className="absolute top-0 right-0 bg-white rounded-full px-2 text-xs">
                      Current
                    </span>
                  </div>
                )}
                {watch('images') && Array.from(watch('images') as FileList).slice(0, 1).map((file, index) => (
                  <div key={index} className="relative">
                    <OptimizedImage
                      src={URL.createObjectURL(file)}
                      alt="New Cover Preview"
                      containerClassName="w-20 h-20"
                      className="rounded-lg object-cover"
                      width={80}
                      height={80}
                    />
                    <span className="absolute top-0 right-0 bg-white rounded-full px-2 text-xs">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Images Section */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Additional Images (Optional)</p>
              <div className="flex flex-wrap gap-2">
                <Label
                  htmlFor="upload-additional"
                  className="flex gap-1 p-2 rounded-lg border border-gray-300 text-gray-600 cursor-pointer text-sm items-center"
                >
                  <Input
                    {...register('additionalImages')}
                    className="hidden"
                    type="file"
                    id="upload-additional"
                    multiple
                    accept="image/png,image/jpeg,image/jpg"
                  />
                  <UploadIcon />
                  Add More Images
                </Label>
                {existingAdditionalImages && existingAdditionalImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {existingAdditionalImages.map((imgId: string, index: number) => (
                      <div key={index} className="relative">
                        <OptimizedImage
                          ucareId={imgId}
                          alt={`Additional image ${index + 1}`}
                          containerClassName="w-16 h-16"
                          className="rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                          onClick={() => {
                            const filteredImages = existingAdditionalImages.filter((_, i) => i !== index);
                            setValue('existingAdditionalImages', filteredImages);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {watch('additionalImages') && Array.from(watch('additionalImages') as FileList).map((file, index) => (
                  <div key={index} className="relative">
                    <OptimizedImage
                      src={URL.createObjectURL(file)}
                      alt={`New additional image ${index + 1}`}
                      containerClassName="w-16 h-16"
                      className="rounded-lg object-cover"
                      width={64}
                      height={64}
                    />
                    <span className="absolute top-0 right-0 bg-white rounded-full px-2 text-xs">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ErrorMessage
            errors={errors}
            name="images"
            render={({ message }) => (
              <p className="text-red-400 mt-2">
                {message === 'Required' ? '' : message}
              </p>
            )}
          />
        </div>

        <FormGenerator
          inputType="input"
          register={register}
          label="Price"
          name="price"
          errors={errors}
          placeholder="0.00"
          type="text"
        />

        <div className="flex items-center gap-2">
          <Switch 
            id="hasDiscount"
            checked={hasDiscount}
            onCheckedChange={handleDiscountToggle}
          />
          <Label htmlFor="hasDiscount">Apply Discount</Label>
        </div>

        {hasDiscount && (
          <>
            <FormGenerator
              inputType="input"
              register={register}
              label="Discount Percentage"
              name="discount"
              errors={errors}
              placeholder="10"
              type="number"
              min="0"
              max="100"
            />

            <div className="flex flex-col gap-1.5">
              <Label>Final Price After Discount</Label>
              <Input
                {...register('discountedPrice')}
                disabled
                className="bg-gray-50"
                placeholder="0.00"
                value={watch('discountedPrice') || ''}
              />
            </div>
          </>
        )}

        {/* Add Product Variants Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Product Variants (Optional)</p>
            <Button
              type="button"
              onClick={addVariant}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Variant
            </Button>
          </div>
          
          {variants.map((variant, variantIndex) => (
            <div key={variantIndex} className="border rounded-lg p-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-700">Variant {variantIndex + 1}</span>
                  <Button
                    type="button"
                    onClick={() => removeVariant(variantIndex)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label>Variant Name</Label>
                  <Input
                    placeholder="Variant name (e.g. Size, Color)"
                    value={variant.name}
                    onChange={(e) => updateVariantName(variantIndex, e.target.value)}
                  />
                  <span className="text-xs text-gray-500">Enter a name for this variant type</span>
                </div>

                <div className="space-y-1.5">
                  <Label>Inventory Tracking</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={variant.trackQuantity}
                      onCheckedChange={() => toggleQuantityTracking(variantIndex)}
                      id={`track-quantity-${variantIndex}`}
                    />
                    <Label htmlFor={`track-quantity-${variantIndex}`}>Track stock quantity for this variant</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Options</span>
                    <Button
                      type="button"
                      onClick={() => addVariantOption(variantIndex)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Option
                    </Button>
                  </div>

                  {variant.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex flex-col gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-700">Option {optionIndex + 1}</span>
                        <Button
                          type="button"
                          onClick={() => removeVariantOption(variantIndex, optionIndex)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <div className="space-y-1.5">
                          <Label>Option Value</Label>
                          <Input
                            placeholder="Option value (e.g. Small, Red)"
                            value={option.value}
                            onChange={(e) => updateVariantOption(variantIndex, optionIndex, 'value', e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label>Price Adjustment</Label>
                          <Input
                            type="number"
                            placeholder="Price adjustment"
                            value={option.priceAdjustment}
                            onChange={(e) => updateVariantOption(variantIndex, optionIndex, 'priceAdjustment', e.target.value)}
                            step="0.01"
                          />
                          <span className="text-xs text-gray-500">Enter positive or negative values to adjust the base price</span>
                        </div>

                        {variant.trackQuantity && (
                          <div className="space-y-1.5">
                            <Label>Stock Quantity</Label>
                            <Input
                              type="number"
                              placeholder="Quantity"
                              value={option.quantity}
                              onChange={(e) => updateVariantOption(variantIndex, optionIndex, 'quantity', e.target.value)}
                              min="0"
                              step="1"
                            />
                            <span className="text-xs text-gray-500">Number of items in stock for this variant</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full border border-indigo-500 text-indigo-500"
        >
          <Loader loading={loading}>{editingProductId ? 'Update Product' : 'Create Product'}</Loader>
        </Button>
      </form>
    </div>
  )
}
