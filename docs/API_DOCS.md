# NagarSathi API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-api-domain.com/api
```

## Authentication

All protected routes require a Bearer token from Clerk:

```
Authorization: Bearer <clerk_session_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "title", "message": "Required" }]
}
```

---

## Endpoints

### Health Check

#### GET /api/health
Check API status.

**Response:**
```json
{
  "success": true,
  "message": "NagarSathi API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

## Users

### POST /api/users/sync
Sync user from Clerk to database.

**Access:** Authenticated  
**Response:** User object

### GET /api/users/me
Get current user profile.

**Access:** Authenticated  
**Response:** User object

### PUT /api/users/me
Update current user profile.

**Access:** Authenticated  
**Body:**
```json
{
  "name": "string",
  "avatar": "string (URL)"
}
```

### GET /api/users/:id
Get user by ID.

**Access:** Public  
**Response:** User object (limited fields)

---

## Issues

### GET /api/issues
Get all issues with filtering and pagination.

**Access:** Public  
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| category | string | Filter by category |
| status | string | Filter by status |
| search | string | Search in title/description |
| sort | string | Sort field (e.g., -createdAt, -upvotesCount) |
| lat | number | Latitude for geo search |
| lng | number | Longitude for geo search |
| radius | number | Radius in km (default: 10) |

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [Issue]
}
```

### GET /api/issues/map
Get issues for map view (minimal data).

**Access:** Public  
**Query Parameters:** Same as GET /api/issues

### GET /api/issues/user/my-issues
Get current user's issues.

**Access:** Authenticated

### POST /api/issues
Create new issue.

**Access:** Authenticated  
**Content-Type:** multipart/form-data

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Issue title (max 100 chars) |
| description | string | Yes | Issue description (max 2000 chars) |
| category | string | Yes | One of: pothole, garbage, water_leak, streetlight, drainage, road_damage, other |
| location | JSON string | Yes | `{"type":"Point","coordinates":[lng,lat],"address":"..."}` |
| images | File[] | No | Up to 5 images |

### GET /api/issues/:id
Get issue details.

**Access:** Public  
**Response:** Full issue object with populated references

### PUT /api/issues/:id
Update own issue.

**Access:** Authenticated (Owner only)  
**Content-Type:** multipart/form-data

**Body:**
| Field | Type | Description |
|-------|------|-------------|
| title | string | Updated title |
| description | string | Updated description |
| category | string | Updated category |
| images | File[] | Additional images |

### DELETE /api/issues/:id
Delete issue.

**Access:** Authenticated (Owner or Admin)

---

## Comments

### GET /api/issues/:issueId/comments
Get comments for an issue.

**Access:** Public  
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page (default: 20) |

### POST /api/issues/:issueId/comments
Add comment to issue.

**Access:** Authenticated  
**Body:**
```json
{
  "content": "string (max 1000 chars)"
}
```

### DELETE /api/comments/:id
Delete comment.

**Access:** Authenticated (Owner or Admin)

---

## Upvotes

### POST /api/issues/:issueId/upvote
Toggle upvote on issue.

**Access:** Authenticated  
**Response:**
```json
{
  "success": true,
  "message": "Issue upvoted",
  "data": {
    "upvoted": true,
    "upvotesCount": 42
  }
}
```

### GET /api/issues/:issueId/upvote/status
Check if current user has upvoted.

**Access:** Authenticated  
**Response:**
```json
{
  "success": true,
  "data": { "upvoted": true }
}
```

### GET /api/issues/:issueId/upvote/count
Get upvote count.

**Access:** Public

---

## Admin Routes

All admin routes require admin role.

### GET /api/admin/issues
Get all issues (admin view).

**Access:** Admin  
**Query Parameters:** Same as GET /api/issues

### PUT /api/admin/issues/:id/status
Update issue status.

**Access:** Admin  
**Body:**
```json
{
  "status": "reported | in_progress | resolved",
  "note": "string (optional)"
}
```

### POST /api/admin/issues/:id/resolve
Mark issue as resolved with proof.

**Access:** Admin  
**Content-Type:** multipart/form-data

**Body:**
| Field | Type | Description |
|-------|------|-------------|
| note | string | Resolution note |
| images | File[] | Resolution proof (up to 3) |

### GET /api/admin/analytics
Get analytics data.

**Access:** Admin  
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| days | number | Days to analyze (default: 30) |

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalIssues": 100,
      "totalUsers": 50,
      "resolutionRate": 85.5,
      "reportedToday": 5
    },
    "statusBreakdown": {
      "reported": 10,
      "in_progress": 5,
      "resolved": 85
    },
    "categoryBreakdown": [...],
    "issuesOverTime": [...],
    "trendingIssues": [...],
    "hotspots": [...]
  }
}
```

### GET /api/admin/users
Get all users.

**Access:** Admin

### PUT /api/admin/users/:id/role
Update user role.

**Access:** Admin  
**Body:**
```json
{
  "role": "user | admin"
}
```

---

## Data Models

### User
```javascript
{
  _id: ObjectId,
  clerkUserId: String,
  email: String,
  name: String,
  avatar: String,
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Issue
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  images: [String],
  location: {
    type: "Point",
    coordinates: [Number, Number],
    address: String
  },
  status: "reported" | "in_progress" | "resolved",
  statusTimeline: [{
    status: String,
    updatedAt: Date,
    updatedBy: ObjectId,
    note: String
  }],
  createdBy: ObjectId,
  upvotesCount: Number,
  commentsCount: Number,
  resolutionProof: {
    images: [String],
    note: String,
    resolvedAt: Date,
    resolvedBy: ObjectId
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Comment
```javascript
{
  _id: ObjectId,
  issue: ObjectId,
  user: ObjectId,
  content: String,
  createdAt: Date
}
```

### Upvote
```javascript
{
  _id: ObjectId,
  issue: ObjectId,
  user: ObjectId,
  createdAt: Date
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production:
- 100 requests per minute for authenticated users
- 20 requests per minute for public endpoints
