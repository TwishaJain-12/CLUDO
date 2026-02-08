# CLUDO API Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Models](#data-models)
7. [External Services](#external-services)
8. [Request/Response Flow](#requestresponse-flow)

---

## System Overview

CLUDO (formerly NagarSathi) is a full-stack civic engagement platform with three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLUDO Platform                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   React      │◄────►│   Express    │◄────►│  Streamlit   │  │
│  │   Frontend   │      │   REST API   │      │  AI Auditor  │  │
│  │  (Port 5173) │      │  (Port 5000) │      │  (Port 8501) │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         │                      │                      │          │
│         ▼                      ▼                      ▼          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │    Clerk     │      │   MongoDB    │      │  Gemini AI   │  │
│  │    Auth      │      │    Atlas     │      │  2.0 Flash   │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                                │                                 │
│                        ┌───────▼────────┐                       │
│                        │   Cloudinary   │                       │
│                        │ Image Storage  │                       │
│                        └────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend (Express API)
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Clerk (@clerk/express)
- **File Upload:** Multer + Cloudinary
- **AI Integration:** Google Gemini 2.0 Flash

### Key Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "@clerk/express": "^1.0.0",
  "cloudinary": "^1.41.0",
  "multer": "^1.4.5-lts.1",
  "@google/generative-ai": "^0.1.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

---


## Architecture Layers

### 1. Presentation Layer (Routes)
Handles HTTP requests and routes them to appropriate controllers.

```
server/routes/
├── userRoutes.js          # User management
├── issueRoutes.js         # Issue CRUD operations
├── commentRoutes.js       # Comments on issues
├── upvoteRoutes.js        # Upvoting system
├── reportRoutes.js        # Issue reporting/flagging
├── adminRoutes.js         # Admin operations
├── notificationRoutes.js  # User notifications
├── geocodeRoutes.js       # Address ↔ Coordinates
├── satellite.js           # Satellite data
└── satelliteAudit.js      # AI environmental audits
```

### 2. Business Logic Layer (Controllers)
Processes requests, applies business rules, and interacts with models.

```
server/controllers/
├── userController.js
├── issueController.js
├── commentController.js
├── upvoteController.js
├── reportController.js
├── adminController.js
├── notificationController.js
├── satelliteController.js
└── satelliteAuditController.js
```

### 3. Data Access Layer (Models)
Defines data schemas and database interactions.

```
server/models/
├── User.js              # User profiles
├── Issue.js             # Civic issues
├── Comment.js           # Issue comments
├── Upvote.js            # Upvote records
├── IssueReport.js       # Issue reports/flags
├── Notification.js      # User notifications
├── SatelliteAudit.js    # AI audit records
└── ReportStats.js       # Report statistics
```

### 4. Middleware Layer
Handles cross-cutting concerns.

```
server/middleware/
├── auth.js              # Clerk authentication
├── roleCheck.js         # Admin authorization
└── errorHandler.js      # Global error handling
```

---

## API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production:  https://your-domain.com/api
```

### 1. Health Check
```
GET /api/health
```
**Purpose:** Check API status  
**Auth:** None  
**Response:**
```json
{
  "success": true,
  "message": "NagarSathi API is running",
  "timestamp": "2026-02-08T12:00:00.000Z",
  "environment": "development"
}
```

---

### 2. User Management (`/api/users`)

#### Sync User from Clerk
```
POST /api/users/sync
Auth: Required
```
Creates/updates user in MongoDB from Clerk data.

#### Get Current User
```
GET /api/users/me
Auth: Required
```
Returns authenticated user's profile.

#### Update Profile
```
PUT /api/users/me
Auth: Required
Body: { name, avatar }
```

#### Get User by ID
```
GET /api/users/:id
Auth: None (Public)
```

---

### 3. Issue Management (`/api/issues`)

#### Get All Issues
```
GET /api/issues
Auth: Optional
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - category: string
  - status: string
  - search: string
  - sort: string
  - lat: number (for geo search)
  - lng: number (for geo search)
  - radius: number (km, default: 10)
```

#### Get Issues for Map View
```
GET /api/issues/map
Auth: None
```
Returns minimal data optimized for map markers.

#### Get Filter Counts
```
GET /api/issues/filter-counts
Auth: None
```
Returns count of issues by category and status.

#### Get Issue by ID
```
GET /api/issues/:id
Auth: Optional
```

#### Create Issue
```
POST /api/issues
Auth: Required
Content-Type: multipart/form-data
Body:
  - title: string (max 100 chars)
  - description: string (max 2000 chars)
  - category: string (enum)
  - location: JSON string
  - images: File[] (max 5)
```

#### Update Issue
```
PUT /api/issues/:id
Auth: Required (Owner only)
Content-Type: multipart/form-data
```

#### Delete Issue
```
DELETE /api/issues/:id
Auth: Required (Owner or Admin)
```

#### Get My Issues
```
GET /api/issues/user/my-issues
Auth: Required
```

---

### 4. Comments (`/api/issues/:issueId/comments`)

#### Get Comments
```
GET /api/issues/:issueId/comments
Auth: None
Query: page, limit
```

#### Add Comment
```
POST /api/issues/:issueId/comments
Auth: Required
Body: { content: string (max 1000 chars) }
```

#### Delete Comment
```
DELETE /api/comments/:id
Auth: Required (Owner or Admin)
```

---

### 5. Upvotes (`/api/issues/:issueId/upvote`)

#### Toggle Upvote
```
POST /api/issues/:issueId/upvote
Auth: Required
```
Adds upvote if not exists, removes if exists.

#### Get Upvote Status
```
GET /api/issues/:issueId/upvote/status
Auth: Required
```
Returns whether current user has upvoted.

#### Get Upvote Count
```
GET /api/issues/:issueId/upvote/count
Auth: None
```

---

### 6. Reports (`/api/issues/:issueId/report`)

#### Submit Report
```
POST /api/issues/:issueId/report
Auth: Required
Body: {
  reason: string (enum),
  description: string
}
```

#### Get Report Status
```
GET /api/issues/:issueId/report/status
Auth: Required
```

#### Get Report Count
```
GET /api/issues/:issueId/report/count
Auth: Optional
```

#### Get My Reports
```
GET /api/reports/my-reports
Auth: Required
```

---

### 7. Admin Operations (`/api/admin`)

**All routes require Admin role**

#### Get All Issues
```
GET /api/admin/issues
Auth: Required (Admin)
Query: page, limit, filters
```

#### Update Issue Status
```
PUT /api/admin/issues/:id/status
Auth: Required (Admin)
Body: {
  status: "reported" | "in_progress" | "resolved",
  note: string (optional)
}
```

#### Resolve Issue
```
POST /api/admin/issues/:id/resolve
Auth: Required (Admin)
Content-Type: multipart/form-data
Body:
  - note: string
  - images: File[] (max 3)
```

#### Get Analytics
```
GET /api/admin/analytics
Auth: Required (Admin)
Query: days (default: 30)
```

#### Get All Users
```
GET /api/admin/users
Auth: Required (Admin)
```

#### Update User Role
```
PUT /api/admin/users/:id/role
Auth: Required (Admin)
Body: { role: "user" | "admin" }
```

#### Report Management
```
GET /api/admin/reports              # All reports
GET /api/admin/reports/grouped      # Grouped by issue
GET /api/admin/reports/analytics    # Report statistics
GET /api/admin/reports/:id          # Single report
PUT /api/admin/reports/:id/review   # Review report
DELETE /api/admin/reports/:id       # Dismiss report
```

---

### 8. Notifications (`/api/notifications`)

**All routes require authentication**

#### Get Notifications
```
GET /api/notifications
Auth: Required
Query: page, limit
```

#### Get Unread Count
```
GET /api/notifications/unread-count
Auth: Required
```

#### Mark as Read
```
PUT /api/notifications/:id/read
Auth: Required
```

#### Mark All as Read
```
PUT /api/notifications/read-all
Auth: Required
```

#### Delete Notification
```
DELETE /api/notifications/:id
Auth: Required
```

#### Clear All Notifications
```
DELETE /api/notifications
Auth: Required
```

---

### 9. Geocoding (`/api/geocode`)

#### Forward Geocode (Address → Coordinates)
```
GET /api/geocode/search
Auth: None
Query: q (address string)
Response: { lat, lon, display_name }
```

#### Reverse Geocode (Coordinates → Address)
```
GET /api/geocode/reverse
Auth: None
Query: lat, lon
Response: { display_name, address, lat, lon }
```

**Note:** Proxies OpenStreetMap Nominatim API to avoid CORS issues.

---

### 10. Satellite Data (`/api/satellite`)

#### Get Satellite Data
```
GET /api/satellite/data
Auth: None
Query: location, timeRange
```
Returns satellite imagery tiles and statistics.

#### Generate AI Audit Report
```
POST /api/satellite/audit
Auth: None
Body: {
  location: { lat, lng },
  timeRange: { start, end },
  issueType: string
}
```
Uses Gemini AI to analyze satellite data.

---

### 11. Satellite Audits (`/api/satellite-audit`)

#### Create Audit
```
POST /api/satellite-audit
Auth: Required
Body: {
  issueId: string,
  location: object,
  timeRange: object,
  category: string
}
```

#### Get Audit by Issue
```
GET /api/satellite-audit/issue/:issueId
Auth: None
```

#### Generate Certificate
```
GET /api/satellite-audit/:auditId/certificate
Auth: None
```
Returns downloadable audit certificate.

#### Get Historical Data
```
GET /api/satellite-audit/historical
Auth: None
Query: location, startDate, endDate
```

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Login via Clerk
       ▼
┌─────────────┐
│    Clerk    │
└──────┬──────┘
       │ 2. Returns JWT
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 3. Request with Bearer token
       ▼
┌─────────────┐
│  Express    │
│     API     │
└──────┬──────┘
       │ 4. Verify token with Clerk
       ▼
┌─────────────┐
│  Middleware │
│   (auth.js) │
└──────┬──────┘
       │ 5. Attach user to req.auth
       ▼
┌─────────────┐
│ Controller  │
└─────────────┘
```

### Middleware Types

#### 1. `requireAuth`
- **Purpose:** Ensures user is authenticated
- **Usage:** Protected routes
- **Behavior:** Returns 401 if no valid token

#### 2. `optionalAuth`
- **Purpose:** Attaches user if authenticated, allows anonymous
- **Usage:** Public routes that benefit from user context
- **Behavior:** Continues even without token

#### 3. `requireAdmin`
- **Purpose:** Ensures user has admin role
- **Usage:** Admin-only routes
- **Behavior:** Returns 403 if not admin

### Authorization Levels

| Level | Access |
|-------|--------|
| **Public** | Anyone (no auth required) |
| **Authenticated** | Logged-in users |
| **Owner** | Resource creator only |
| **Admin** | Admin role required |

### Example Usage

```javascript
// Public route
router.get('/issues', optionalAuth, getIssues);

// Authenticated route
router.post('/issues', requireAuth, createIssue);

// Admin route
router.use('/admin', requireAuth, requireAdmin);
```

---

## Data Models

### User Model
```javascript
{
  clerkUserId: String (unique, required),
  email: String (required),
  name: String,
  avatar: String (URL),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Issue Model
```javascript
{
  title: String (required, max: 100),
  description: String (required, max: 2000),
  category: String (enum: [
    'pothole', 'garbage', 'water_leak', 
    'streetlight', 'drainage', 'road_damage', 
    'deforestation', 'pollution', 'other'
  ]),
  images: [String] (URLs, max: 5),
  location: {
    type: 'Point',
    coordinates: [Number, Number], // [lng, lat]
    address: String
  },
  status: String (enum: [
    'reported', 'in_progress', 'resolved'
  ], default: 'reported'),
  statusTimeline: [{
    status: String,
    updatedAt: Date,
    updatedBy: ObjectId (ref: User),
    note: String
  }],
  createdBy: ObjectId (ref: User, required),
  upvotesCount: Number (default: 0),
  commentsCount: Number (default: 0),
  reportsCount: Number (default: 0),
  resolutionProof: {
    images: [String],
    note: String,
    resolvedAt: Date,
    resolvedBy: ObjectId (ref: User)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model
```javascript
{
  issue: ObjectId (ref: Issue, required),
  user: ObjectId (ref: User, required),
  content: String (required, max: 1000),
  createdAt: Date
}
```

### Upvote Model
```javascript
{
  issue: ObjectId (ref: Issue, required),
  user: ObjectId (ref: User, required),
  createdAt: Date
}
// Compound unique index on (issue, user)
```

### IssueReport Model
```javascript
{
  issue: ObjectId (ref: Issue, required),
  reportedBy: ObjectId (ref: User, required),
  reason: String (enum: [
    'spam', 'inappropriate', 'duplicate', 
    'misleading', 'other'
  ]),
  description: String (max: 500),
  status: String (enum: [
    'pending', 'reviewed', 'dismissed'
  ], default: 'pending'),
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  reviewNote: String,
  createdAt: Date
}
```

### Notification Model
```javascript
{
  user: ObjectId (ref: User, required),
  type: String (enum: [
    'issue_status_update', 'comment_on_issue',
    'upvote_milestone', 'admin_message'
  ]),
  title: String (required),
  message: String (required),
  relatedIssue: ObjectId (ref: Issue),
  relatedUser: ObjectId (ref: User),
  read: Boolean (default: false),
  createdAt: Date
}
```

### SatelliteAudit Model
```javascript
{
  issue: ObjectId (ref: Issue),
  location: {
    type: 'Point',
    coordinates: [Number, Number]
  },
  timeRange: {
    start: Date,
    end: Date
  },
  category: String,
  analysis: {
    riskLevel: String (enum: [
      'low', 'medium', 'high', 'critical'
    ]),
    summary: String,
    recommendations: [String],
    confidence: Number (0-100),
    ndviData: [{
      date: Date,
      value: Number
    }],
    moistureData: [{
      date: Date,
      value: Number
    }]
  },
  geminiResponse: Object,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

---

## External Services

### 1. Clerk Authentication
**Purpose:** User authentication and management  
**Integration:** `@clerk/express`  
**Features:**
- JWT-based authentication
- User session management
- OAuth providers (Google, GitHub, etc.)
- Webhook support for user events

**Configuration:**
```javascript
import { createClerkClient } from '@clerk/express';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});
```

---

### 2. MongoDB Atlas
**Purpose:** Primary database  
**Integration:** Mongoose ODM  
**Features:**
- Document-based storage
- Geospatial queries (for location-based issues)
- Aggregation pipelines (for analytics)
- Indexes for performance

**Connection:**
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

**Indexes:**
- `Issue.location` - 2dsphere index for geo queries
- `Issue.status` - For filtering
- `Issue.category` - For filtering
- `Upvote.(issue, user)` - Compound unique index
- `Comment.issue` - For efficient comment retrieval

---

### 3. Cloudinary
**Purpose:** Image storage and optimization  
**Integration:** `cloudinary` + `multer-storage-cloudinary`  
**Features:**
- Image upload and storage
- Automatic optimization
- Transformation on-the-fly
- CDN delivery

**Configuration:**
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

**Upload Limits:**
- Issue images: Max 5 per issue
- Resolution proof: Max 3 images
- Max file size: 10MB per image

---

### 4. Google Gemini AI
**Purpose:** Satellite data analysis and environmental auditing  
**Integration:** `@google/generative-ai`  
**Model:** Gemini 2.0 Flash Exp  
**Features:**
- Natural language analysis
- Risk assessment
- Recommendation generation
- Confidence scoring

**Usage:**
```javascript
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp" 
});
```

---

### 5. OpenStreetMap Nominatim
**Purpose:** Geocoding (address ↔ coordinates)  
**Integration:** Direct HTTP API calls  
**Features:**
- Forward geocoding (address to coordinates)
- Reverse geocoding (coordinates to address)
- Free and open-source

**API Proxy:**
Server proxies requests to avoid CORS issues:
```
Client → Express API → Nominatim API
```

---

## Request/Response Flow

### 1. Standard CRUD Operation Flow

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │ 1. HTTP Request
       │    Authorization: Bearer <token>
       ▼
┌─────────────┐
│    CORS     │
│  Middleware │
└──────┬──────┘
       │ 2. Validate origin
       ▼
┌─────────────┐
│    Auth     │
│  Middleware │
└──────┬──────┘
       │ 3. Verify JWT with Clerk
       │    Attach user to req.auth
       ▼
┌─────────────┐
│   Router    │
└──────┬──────┘
       │ 4. Route to controller
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 5. Business logic
       │    Validation
       ▼
┌─────────────┐
│    Model    │
│  (Mongoose) │
└──────┬──────┘
       │ 6. Database query
       ▼
┌─────────────┐
│   MongoDB   │
└──────┬──────┘
       │ 7. Return data
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 8. Format response
       ▼
┌─────────────┐
│   Client    │
│  (React)    │
└─────────────┘
```

---

### 2. Image Upload Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST multipart/form-data
       │    images + JSON data
       ▼
┌─────────────┐
│   Multer    │
│  Middleware │
└──────┬──────┘
       │ 2. Parse multipart data
       │    Validate file types
       ▼
┌─────────────┐
│ Cloudinary  │
│   Storage   │
└──────┬──────┘
       │ 3. Upload to Cloudinary
       │    Return URLs
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 4. Save URLs to MongoDB
       ▼
┌─────────────┐
│   MongoDB   │
└──────┬──────┘
       │ 5. Return issue with image URLs
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

---

### 3. Geospatial Query Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. GET /api/issues?lat=X&lng=Y&radius=10
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 2. Build geo query
       │    $geoNear aggregation
       ▼
┌─────────────┐
│   MongoDB   │
│  2dsphere   │
│    Index    │
└──────┬──────┘
       │ 3. Find issues within radius
       │    Sort by distance
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 4. Populate user data
       │    Calculate distances
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

---

### 4. AI Audit Flow

```
┌─────────────┐
│   Client    │
│ (Streamlit) │
└──────┬──────┘
       │ 1. POST /api/satellite/audit
       │    location, timeRange, category
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 2. Generate mock satellite data
       │    Calculate NDVI, moisture
       ▼
┌─────────────┐
│  Gemini AI  │
└──────┬──────┘
       │ 3. Analyze data
       │    Generate risk assessment
       │    Create recommendations
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 4. Save audit to MongoDB
       ▼
┌─────────────┐
│   MongoDB   │
└──────┬──────┘
       │ 5. Return audit report
       ▼
┌─────────────┐
│   Client    │
│ (Streamlit) │
└─────────────┘
```

---

### 5. Admin Analytics Flow

```
┌─────────────┐
│   Admin     │
│   Client    │
└──────┬──────┘
       │ 1. GET /api/admin/analytics?days=30
       ▼
┌─────────────┐
│    Auth     │
│  Middleware │
└──────┬──────┘
       │ 2. Verify admin role
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ 3. Run aggregation pipelines
       │    - Status breakdown
       │    - Category breakdown
       │    - Issues over time
       │    - Trending issues
       │    - Hotspot analysis
       ▼
┌─────────────┐
│   MongoDB   │
│ Aggregation │
└──────┬──────┘
       │ 4. Return analytics data
       ▼
┌─────────────┐
│   Admin     │
│   Client    │
└─────────────┘
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ],
  "stack": "..." // Only in development
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server-side error |

### Error Middleware

```javascript
// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' 
      ? err.stack 
      : undefined
  });
});
```

---

## Performance Optimizations

### 1. Database Indexes
```javascript
// Geospatial index for location queries
Issue.index({ location: '2dsphere' });

// Compound indexes for common queries
Issue.index({ status: 1, createdAt: -1 });
Issue.index({ category: 1, status: 1 });
Upvote.index({ issue: 1, user: 1 }, { unique: true });
```

### 2. Pagination
All list endpoints support pagination:
```
GET /api/issues?page=1&limit=10
```

### 3. Field Selection
Minimize data transfer:
```javascript
// Map view - only essential fields
Issue.find().select('title location status category');
```

### 4. Population Control
```javascript
// Populate only needed fields
Issue.findById(id)
  .populate('createdBy', 'name avatar')
  .populate('comments', 'content user createdAt');
```

### 5. Caching Strategy
- Static assets: CDN (Cloudinary)
- API responses: Client-side caching (React Query)
- Database: MongoDB connection pooling

---

## Security Measures

### 1. Authentication
- JWT tokens via Clerk
- Token verification on every protected route
- Automatic token refresh

### 2. Authorization
- Role-based access control (RBAC)
- Resource ownership validation
- Admin-only routes protected

### 3. Input Validation
- Request body validation
- File type validation
- Size limits enforced

### 4. CORS Configuration
```javascript
cors({
  origin: [
    'http://localhost:5173',
    'https://your-domain.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
```

### 5. Rate Limiting
Consider implementing:
- 100 requests/minute for authenticated users
- 20 requests/minute for public endpoints

### 6. Data Sanitization
- MongoDB injection prevention (Mongoose)
- XSS prevention (input sanitization)
- SQL injection N/A (NoSQL database)

---

## Deployment Architecture

### Development Environment
```
┌─────────────────────────────────────────┐
│         Local Development               │
├─────────────────────────────────────────┤
│                                         │
│  Frontend: http://localhost:5173       │
│  Backend:  http://localhost:5000       │
│  Streamlit: http://localhost:8501      │
│                                         │
│  Database: MongoDB Atlas (Cloud)       │
│  Auth: Clerk (Cloud)                   │
│  Storage: Cloudinary (Cloud)           │
│  AI: Gemini API (Cloud)                │
│                                         │
└─────────────────────────────────────────┘
```

### Production Environment
```
┌─────────────────────────────────────────────────────┐
│              Production Deployment                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Vercel     │  │   Render     │  │ Streamlit │ │
│  │  (Frontend)  │  │  (Backend)   │  │   Cloud   │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                  │                 │       │
│         └──────────┬───────┴─────────────────┘       │
│                    │                                 │
│         ┌──────────▼──────────┐                     │
│         │   External Services  │                     │
│         ├─────────────────────┤                     │
│         │ • MongoDB Atlas     │                     │
│         │ • Clerk Auth        │                     │
│         │ • Cloudinary CDN    │                     │
│         │ • Gemini AI         │                     │
│         └─────────────────────┘                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# Authentication
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...

# Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# AI
GEMINI_API_KEY=...

# CORS
CLIENT_URL=https://your-frontend.vercel.app
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-api.render.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

#### Streamlit (.env)
```env
GEMINI_API_KEY=...
```

---

## Monitoring & Logging

### Application Logs
```javascript
// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Error logging
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
});
```

### Recommended Monitoring Tools
- **Application:** Sentry (error tracking)
- **Database:** MongoDB Atlas monitoring
- **API:** Render/Railway built-in metrics
- **Uptime:** UptimeRobot or Pingdom

---

## API Versioning

### Current Version
```
v1 (implicit)
Base URL: /api
```

### Future Versioning Strategy
```
v2: /api/v2
v3: /api/v3
```

Maintain backward compatibility for at least 6 months after new version release.

---

## Testing Strategy

### Unit Tests
```javascript
// Example: Issue controller tests
describe('Issue Controller', () => {
  test('should create issue with valid data', async () => {
    // Test implementation
  });
  
  test('should reject issue without title', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```javascript
// Example: API endpoint tests
describe('POST /api/issues', () => {
  test('should create issue and return 201', async () => {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${token}`)
      .send(validIssueData);
    
    expect(response.status).toBe(201);
  });
});
```

### Recommended Tools
- **Unit Tests:** Jest
- **Integration Tests:** Supertest
- **E2E Tests:** Cypress or Playwright

---

## API Rate Limits (Recommended)

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Public GET | 100 req | 15 min |
| Authenticated | 1000 req | 15 min |
| Image Upload | 20 req | 15 min |
| Admin | Unlimited | - |

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- User management
- Issue CRUD operations
- Comments and upvotes
- Admin dashboard
- Satellite AI auditing
- Geocoding integration

---

## Support & Contact

For API support or questions:
- **GitHub Issues:** https://github.com/TwishaJain-12/CLUDO/issues
- **Documentation:** See `/docs` folder
- **API Docs:** `/docs/API_DOCS.md`

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Maintained by:** Twisha Jain
