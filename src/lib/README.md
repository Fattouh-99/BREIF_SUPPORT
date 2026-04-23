# API Utilities

## Standardized API Responses

The `api-response.ts` utility provides standardized methods for creating consistent API responses across the application.

### Error Response Format

All API errors now follow this consistent format:

```json
{
  "error": "Error message",
  "details": "Optional additional details or error object"
}
```

With appropriate HTTP status codes:
- 400: Bad Request - Invalid parameters
- 401: Unauthorized - Authentication required
- 404: Not Found - Resource doesn't exist
- 500: Internal Error - Server-side issues
- 503: Service Unavailable - Temporary service issues

### Usage Examples

For success responses:

```typescript
import { successResponse } from '@/lib/api-response'

// Simple success response
return successResponse(data)

// With custom status code
return successResponse(data, 201)
```

For error responses:

```typescript
import { ApiError } from '@/lib/api-response'

// Common error types
return ApiError.Unauthorized()
return ApiError.NotFound('User not found')
return ApiError.BadRequest('Invalid parameters')
return ApiError.InternalError()

// With additional details
return ApiError.InternalError(error.message)
```

### Benefits

- **Consistency**: All API responses follow the same pattern, making frontend handling simpler
- **Maintainability**: Changes to response formatting can be made in one place
- **Clarity**: Clear, descriptive error messages improve API usability
- **Extensibility**: The error system can be easily extended with new types 