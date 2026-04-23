# User API Endpoints

## Consolidated User Endpoint

The `/api/user/me` endpoint has replaced multiple previous endpoints to reduce duplication and improve maintainability.

### Query Parameters

- `includeTeam=true` - Include team information in the response
- `includeDashboard=true` - Include dashboard preferences in the response

### Examples

- Basic user info: `/api/user/me`
- User with team data: `/api/user/me?includeTeam=true`
- User with dashboard preferences: `/api/user/me?includeDashboard=true`
- Complete user data: `/api/user/me?includeTeam=true&includeDashboard=true`

### Response Format

Success response:
```json
{
  "id": "user-id",
  "fullname": "User Name",
  "email": "user@example.com",
  "teamId": "team-id",
  "role": "MEMBER",
  "team": {
    "id": "team-id",
    "name": "Team Name"
  },
  "dashboard": "both"
}
```

Error response:
```json
{
  "error": "Error message",
  "details": "Optional additional details"
}
```

Note:
- The `team` and `dashboard` fields will only be included if requested via query parameters.
- All API errors follow the standardized format defined in `@/lib/api-response.ts`. 