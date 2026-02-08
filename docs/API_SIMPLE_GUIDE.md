# CLUDO API - Simple Guide

## What APIs Are Used and Where

Think of APIs as different services that help your app work. Here's what each one does:

---

## 🔐 1. Clerk API (Authentication)
**What it does:** Handles user login and signup  
**Where it's used:**
- When users sign up for an account
- When users log in
- When checking if someone is logged in
- Protecting pages that need login

**Example:**
```
User clicks "Sign Up" → Clerk creates account → User can now login
```

---

## 🗄️ 2. MongoDB API (Database)
**What it does:** Stores all your app's data  
**Where it's used:**
- Saving new issues (potholes, garbage, etc.)
- Storing user profiles
- Keeping track of comments
- Counting upvotes
- Storing admin actions

**Example:**
```
User reports pothole → Data saved to MongoDB → Shows up on map
```

---

## 📸 3. Cloudinary API (Image Storage)
**What it does:** Stores and delivers photos  
**Where it's used:**
- When users upload issue photos
- When admins upload resolution proof
- Displaying images on the website
- Making images load faster (CDN)

**Example:**
```
User takes photo of garbage → Uploads to Cloudinary → Photo appears in issue
```

---

## 🤖 4. Gemini AI API (Artificial Intelligence)
**What it does:** Analyzes satellite data and gives smart insights  
**Where it's used:**
- Environmental auditing (Streamlit app)
- Analyzing deforestation
- Checking vegetation health (NDVI)
- Giving risk assessments
- Creating recommendations

**Example:**
```
Admin requests audit → Gemini analyzes satellite data → Shows risk level
```

---

## 🗺️ 5. OpenStreetMap API (Maps & Locations)
**What it does:** Converts addresses to map coordinates and vice versa  
**Where it's used:**
- When user clicks on map to report issue
- Converting "123 Main St" to latitude/longitude
- Showing issue locations on map
- Getting address from GPS coordinates

**Example:**
```
User clicks map → Gets coordinates → Converts to address → Saves location
```

---

## How They Work Together

### Reporting an Issue:
```
1. User logs in → Clerk API ✓
2. User clicks map location → OpenStreetMap API 🗺️
3. User uploads photo → Cloudinary API 📸
4. Issue saved → MongoDB API 🗄️
5. Issue appears on map for everyone
```

### Environmental Audit:
```
1. Admin requests audit → Your Backend API
2. Gets satellite data → Mock data generated
3. Analyzes with AI → Gemini API 🤖
4. Saves audit report → MongoDB API 🗄️
5. Shows results in Streamlit app
```

### Viewing Issues:
```
1. User opens map → Your Backend API
2. Gets all issues → MongoDB API 🗄️
3. Shows locations → OpenStreetMap API 🗺️
4. Loads photos → Cloudinary API 📸
5. Displays on map
```

---

## Your Own Backend API

**What it does:** Connects everything together  
**Base URL:** `http://localhost:5000/api` (development)

### Main Features:

#### 📝 Issues
- `POST /api/issues` - Report new issue
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get one issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

#### 💬 Comments
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/issues/:id/comments` - Get comments
- `DELETE /api/comments/:id` - Delete comment

#### 👍 Upvotes
- `POST /api/issues/:id/upvote` - Upvote/remove upvote
- `GET /api/issues/:id/upvote/count` - Get upvote count

#### 👤 Users
- `GET /api/users/me` - Get my profile
- `PUT /api/users/me` - Update my profile

#### 🛡️ Admin
- `GET /api/admin/issues` - See all issues
- `PUT /api/admin/issues/:id/status` - Change status
- `POST /api/admin/issues/:id/resolve` - Mark as resolved
- `GET /api/admin/analytics` - Get statistics

#### 🛰️ Satellite
- `POST /api/satellite/audit` - Request AI audit
- `GET /api/satellite-audit/issue/:id` - Get audit for issue

---

## Simple Flow Diagram

```
┌─────────────┐
│    USER     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   REACT     │ ← Your Frontend
│   WEBSITE   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   EXPRESS   │ ← Your Backend API
│   SERVER    │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│    CLERK    │   │   MONGODB   │
│    (Auth)   │   │  (Database) │
└─────────────┘   └─────────────┘
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ CLOUDINARY  │   │  GEMINI AI  │
│  (Images)   │   │  (Analysis) │
└─────────────┘   └─────────────┘
       │
       ▼
┌─────────────┐
│ OPENSTREET  │
│    MAP      │
└─────────────┘
```

---

## Cost Breakdown

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Clerk** | ✅ Yes | 5,000 users |
| **MongoDB Atlas** | ✅ Yes | 512MB storage |
| **Cloudinary** | ✅ Yes | 25GB storage, 25GB bandwidth |
| **Gemini AI** | ✅ Yes | 60 requests/minute |
| **OpenStreetMap** | ✅ Free | Unlimited (fair use) |

**Total Cost for Small Project:** $0/month 🎉

---

## Quick Reference

### When User Reports Issue:
1. **Clerk** - Checks if logged in
2. **OpenStreetMap** - Gets location
3. **Cloudinary** - Stores photo
4. **MongoDB** - Saves issue data

### When Admin Resolves Issue:
1. **Clerk** - Checks if admin
2. **Cloudinary** - Stores proof photo
3. **MongoDB** - Updates issue status
4. **MongoDB** - Creates notification

### When Running AI Audit:
1. **Your API** - Generates satellite data
2. **Gemini AI** - Analyzes data
3. **MongoDB** - Saves audit report
4. **Streamlit** - Shows results

---

## Need Help?

- **API not working?** Check if services are running
- **Images not uploading?** Check Cloudinary credentials
- **Login not working?** Check Clerk API keys
- **Database errors?** Check MongoDB connection

---

**Made Simple for Everyone! 🚀**
