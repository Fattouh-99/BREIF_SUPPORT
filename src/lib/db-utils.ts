import { client } from '@/lib/prisma'
import { ApiError } from '@/lib/api-response'
import { Prisma } from '@prisma/client'

/**
 * Database operation timeout in milliseconds (default: 10 seconds)
 */
const DEFAULT_TIMEOUT = 10000

/**
 * Executes a database query with timeout and error handling
 * 
 * @param queryFn - The database query function to execute
 * @param errorMsg - Custom error message on failure
 * @param timeout - Timeout in milliseconds
 * @returns The query result
 * @throws ApiError with appropriate status if query fails
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  errorMsg = 'Database operation failed',
  timeout = DEFAULT_TIMEOUT
): Promise<T> {
  try {
    // Execute query with timeout
    const result = await Promise.race([
      queryFn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), timeout)
      )
    ]) as T;
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    
    // Handle different error types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw ApiError.BadRequest('Unique constraint failed');
      } else if (error.code === 'P2025') {
        throw ApiError.NotFound('Record not found');
      }
    }
    
    if (error instanceof Error && error.message === 'Database query timeout') {
      throw ApiError.ServiceUnavailable('Database request timed out');
    }
    
    throw ApiError.InternalError(`${errorMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find a user by their Clerk ID with error handling
 * 
 * @param clerkId - The Clerk ID to look up
 * @param select - Fields to select (optional)
 * @returns The user object
 * @throws ApiError.NotFound if user not found
 */
export async function findUserByClerkId<T extends Prisma.UserSelect>(
  clerkId: string,
  select?: T
) {
  const user = await executeQuery(
    () => client.user.findUnique({
      where: { clerkId },
      ...(select && { select })
    }),
    'Error finding user'
  );
  
  if (!user) {
    throw ApiError.NotFound('User not found');
  }
  
  return user;
}

/**
 * Find a resource by ID with appropriate error handling
 * 
 * @param model - The Prisma model to query
 * @param id - The resource ID
 * @param options - Additional Prisma query options
 * @param errorMsg - Custom error message if not found
 * @returns The requested resource
 * @throws ApiError.NotFound if resource not found
 */
export async function findResourceById(
  model: any,
  id: string,
  options: any = {},
  errorMsg = 'Resource not found'
) {
  const resource = await executeQuery(
    () => model.findUnique({
      where: { id },
      ...options
    }),
    `Error finding ${model}` 
  );
  
  if (!resource) {
    throw ApiError.NotFound(errorMsg);
  }
  
  return resource;
}

/**
 * Safely creates a database transaction with error handling
 * 
 * @param fn - Function containing transaction operations
 * @returns Result of the transaction
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await executeQuery(
    () => client.$transaction(fn),
    'Transaction failed'
  );
}

/**
 * Safely handles API responses which may not return valid JSON
 * 
 * @param response - The fetch API response
 * @param defaultErrorMessage - Default error message if parsing fails
 * @returns An object with the parsed response or error details
 */
export async function handleApiResponse(
  response: Response,
  defaultErrorMessage = 'Server returned an unexpected response'
): Promise<{ 
  success: boolean; 
  data?: any; 
  error?: string; 
  status: number; 
  isJsonResponse: boolean;
  rawResponse?: string;
}> {
  const status = response.status;
  const contentType = response.headers.get('content-type');
  const isJsonResponse = contentType?.includes('application/json') || false;
  
  // Handle non-JSON responses
  if (!isJsonResponse) {
    const rawResponse = await response.text();
    
    console.warn('Received non-JSON response:', {
      status,
      contentType,
      responsePreview: rawResponse.substring(0, 500) + (rawResponse.length > 500 ? '...' : '')
    });
    
    return {
      success: false,
      error: defaultErrorMessage,
      status,
      isJsonResponse: false,
      rawResponse
    };
  }
  
  // Handle JSON responses
  try {
    const data = await response.json();
    
    return {
      success: response.ok,
      data: response.ok ? data : undefined,
      error: !response.ok ? (data.error || data.message || defaultErrorMessage) : undefined,
      status,
      isJsonResponse: true
    };
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    
    return {
      success: false,
      error: 'Failed to parse server response',
      status,
      isJsonResponse: true
    };
  }
} 