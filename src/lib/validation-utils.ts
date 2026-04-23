import { UserRole } from '@prisma/client';

/**
 * Validates user data before creation/update
 */
export function validateUserData(params: ValidateUserDataParams) {
  const { fullname, clerkId, email, role, products, categories } = params;
  const errors: Record<string, string> = {};
  
  if (!clerkId) {
    errors.clerkId = "Clerk ID is required";
  }
  
  if (!email) {
    errors.email = "Email is required";
  }
  
  // Convert role to UserRole if it's a string
  let validatedRole: UserRole = UserRole.OWNER;
  if (role) {
    if (typeof role === 'string' && Object.values(UserRole).includes(role as UserRole)) {
      validatedRole = role as UserRole;
    } else if (typeof role !== 'string') {
      validatedRole = role;
    } else {
      errors.role = "Invalid role";
    }
  }
  
  // Ensure products and categories are arrays
  const productsArray = Array.isArray(products) ? products : 
                         (typeof products === 'string' ? [products] : []);
  
  const categoriesArray = Array.isArray(categories) ? categories : 
                           (typeof categories === 'string' ? [categories] : []);
  
  const isValid = Object.keys(errors).length === 0;
  
  return {
    isValid,
    errors,
    validatedData: {
      fullname: fullname || 'New User',
      clerkId,
      role: validatedRole,
      products: productsArray,
      categories: categoriesArray,
      email
    }
  };
}

// Type definitions
export interface ValidateUserDataParams {
  fullname?: string;
  clerkId: string;
  email: string;
  role?: UserRole | string;
  products?: string[] | string;
  categories?: string[] | string;
} 