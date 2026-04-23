import React, { useEffect } from 'react'
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  getValues?: any // Make this optional
}

// Predefined options for dropdowns
const PRODUCT_OPTIONS = [
  'Software',
  'Physical Products',
  'Digital Products',
  'Consulting Services',
  'Professional Services',
  'Retail',
  'Subscription Services',
  'Education & Training',
  'Healthcare Services',
  'Food & Beverage'
]

const CATEGORY_OPTIONS = [
  'Electronics',
  'Clothing & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Automotive',
  'Business Services',
  'Technology',
  'Fashion',
  'Food'
]

const AUDIENCE_OPTIONS = [
  'Small Businesses',
  'Enterprises',
  'Consumers (B2C)',
  'Businesses (B2B)',
  'Young Adults (18-24)',
  'Adults (25-40)',
  'Middle-aged (41-65)',
  'Seniors (65+)',
  'Families',
  'Students'
]

const BusinessQuestionsForm = ({ errors, register, setValue, getValues }: Props) => {
  // Handle product selection
  const handleProductChange = (value: string) => {
    setValue('products', [value]);
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setValue('categories', [value]);
  };

  // Handle audience selection
  const handleAudienceChange = (value: string) => {
    setValue('targetAudience', value);
  };

  // Get current values for the dropdowns
  const currentProduct = getValues ? (
    Array.isArray(getValues('products')) && getValues('products').length > 0 
      ? getValues('products')[0] 
      : ''
  ) : '';
  
  const currentCategory = getValues ? (
    Array.isArray(getValues('categories')) && getValues('categories').length > 0 
      ? getValues('categories')[0] 
      : ''
  ) : '';
  
  const currentAudience = getValues ? getValues('targetAudience') || '' : '';

  return (
    <>
      <h2 className="text-gravel dark:text-gray-200 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2">Tell us about your business</h2>
      <p className="text-iridium dark:text-gray-400 text-center text-xs sm:text-sm md:text-base mb-4 sm:mb-6">This helps us personalize your experience</p>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            What products or services do you sell?
          </label>
          <Select
            onValueChange={handleProductChange}
            defaultValue={currentProduct}
          >
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <SelectValue placeholder="Select a product or service" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.products && (
            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm">{errors.products.message as string}</p>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Do you have different product categories that require special handling or expertise?
          </label>
          <Select
            onValueChange={handleCategoryChange}
            defaultValue={currentCategory}
          >
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <SelectValue placeholder="Select a product category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categories && (
            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm">{errors.categories.message as string}</p>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            What is your target audience like?
          </label>
          <Select
            onValueChange={handleAudienceChange}
            defaultValue={currentAudience}
          >
            <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <SelectValue placeholder="Select your target audience" />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.targetAudience && (
            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm">{errors.targetAudience.message as string}</p>
          )}
        </div>
      </div>
    </>
  )
}

export default BusinessQuestionsForm