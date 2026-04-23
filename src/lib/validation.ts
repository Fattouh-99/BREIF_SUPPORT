import { z } from 'zod';
import { NextRequest } from 'next/server';
import { ApiError } from './api-response';

/**
 * Validates request body against a Zod schema
 * 
 * @param req - Next.js request object
 * @param schema - Zod schema for validation
 * @returns Validated and typed data
 */
export async function validateBody<T extends z.ZodType>(
  req: NextRequest, 
  schema: T
): Promise<z.infer<T>> {
  try {
    // Get request body as JSON
    const body = await req.json();
    
    // Validate against schema
    const result = schema.safeParse(body);
    
    if (!result.success) {
      // Format validation errors
      const formatted = result.error.format();
      throw ApiError.BadRequest('Validation error', { errors: formatted });
    }
    
    return result.data;
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      throw ApiError.BadRequest('Invalid JSON in request body');
    }
    
    // Re-throw ApiErrors
    if (error instanceof Response) {
      throw error;
    }
    
    // Unexpected errors
    console.error('Validation error:', error);
    throw ApiError.BadRequest('Error validating request');
  }
}

/**
 * Validates query parameters against a Zod schema
 * 
 * @param req - Next.js request object
 * @param schema - Zod schema for validation
 * @returns Validated and typed query parameters
 */
export function validateQuery<T extends z.ZodType>(
  req: NextRequest, 
  schema: T
): z.infer<T> {
  try {
    // Get URL search params
    const url = new URL(req.url);
    
    // Convert URLSearchParams to a plain object
    const queryObj: Record<string, string | string[]> = {};
    url.searchParams.forEach((value, key) => {
      if (queryObj[key]) {
        if (Array.isArray(queryObj[key])) {
          (queryObj[key] as string[]).push(value);
        } else {
          queryObj[key] = [queryObj[key] as string, value];
        }
      } else {
        queryObj[key] = value;
      }
    });
    
    // Validate against schema
    const result = schema.safeParse(queryObj);
    
    if (!result.success) {
      // Format validation errors
      const formatted = result.error.format();
      throw ApiError.BadRequest('Invalid query parameters', { errors: formatted });
    }
    
    return result.data;
  } catch (error) {
    // Re-throw ApiErrors
    if (error instanceof Response) {
      throw error;
    }
    
    // Unexpected errors
    console.error('Query validation error:', error);
    throw ApiError.BadRequest('Error validating query parameters');
  }
}

/**
 * Higher-order function to validate request body
 * 
 * @param handler - API route handler
 * @param schema - Zod schema for request body
 * @returns Wrapped handler with request validation
 */
export function withBodyValidation<T extends z.ZodType, Args extends any[]>(
  handler: (req: NextRequest, validatedBody: z.infer<T>, ...args: Args) => Promise<Response> | Response,
  schema: T
) {
  return async function validatedHandler(req: NextRequest, ...args: Args): Promise<Response> {
    try {
      const validatedBody = await validateBody(req, schema);
      return handler(req, validatedBody, ...args);
    } catch (error) {
      if (error instanceof Response) return error;
      
      console.error('Validation middleware error:', error);
      return ApiError.InternalError('Unexpected validation error');
    }
  };
}

/**
 * Common schema building blocks for reuse
 */
export const SchemaFragments = {
  id: z.string().uuid({ message: "Must be a valid UUID" }),
  email: z.string().email({ message: "Must be a valid email address" }),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
}; 