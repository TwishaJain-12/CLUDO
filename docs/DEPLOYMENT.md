# NagarSathi Deployment Guide

## Prerequisites

- Node.js 18+ installed locally
- Git repository (GitHub recommended)
- MongoDB Atlas account
- Clerk account
- Cloudinary account
- Vercel account (for frontend)
- Render or Railway account (for backend)

---

## 1. Prepare for Deployment

### Update Environment Variables

Make sure you have production values for all environment variables.

### Backend Production Build

```bash
cd server
npm install --production
```

### Frontend Production Build

```bash
cd client
npm install
npm run build
```

---

## 2. Deploy Backend (Render)

### Step 1: Push to GitHub

Ensure your code is pushed to a GitHub repository.

### Step 2: Create Render Account

Go to [render.com](https://render.com) and sign up.

### Step 3: Create Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** nagarsathi-api
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free (or paid for better performance)

### Step 4: Set Environment Variables

In Render dashboard, add all environment variables:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Step 5: Deploy

Click "Create Web Service" and wait for deployment.

Your API will be available at: `https://nagarsathi-api.onrender.com`

---

## 3. Deploy Frontend (Vercel)

### Step 1: Create Vercel Account

Go to [vercel.com](https://vercel.com) and sign up with GitHub.

### Step 2: Import Project

1. Click "New Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Set Environment Variables

Add environment variables in Vercel:

```
VITE_API_URL=https://nagarsathi-api.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

Your frontend will be available at: `https://nagarsathi.vercel.app`

---

## 4. Configure Clerk for Production

### Update Clerk Dashboard

1. Go to [clerk.com](https://clerk.com) dashboard
2. Switch to Production mode
3. Add your production domains:
   - Frontend: `https://nagarsathi.vercel.app`
   - Backend: `https://nagarsathi-api.onrender.com`
4. Get production API keys and update environment variables

### Update Allowed Origins

In Clerk dashboard → Settings → Paths:
- Add your production frontend URL

---

## 5. Configure MongoDB Atlas

### Network Access

1. Go to MongoDB Atlas dashboard
2. Navigate to Network Access
3. Add IP addresses:
   - `0.0.0.0/0` (allows all IPs, or add specific Render IPs)

### Database User

Ensure your database user has read/write permissions.

---

## 6. Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] Clerk authentication works
- [ ] Image uploads work (Cloudinary)
- [ ] Map displays correctly
- [ ] Database operations work
- [ ] Admin dashboard accessible

---

## 7. Monitoring & Maintenance

### Render Dashboard
- View logs
- Monitor memory/CPU usage
- Set up alerts

### Vercel Dashboard
- View deployment logs
- Monitor build times
- Set up preview deployments

### MongoDB Atlas
- Monitor database size
- Set up alerts for high usage
- Regular backups

---

## 8. Troubleshooting

### CORS Issues
Ensure `CLIENT_URL` in backend `.env` matches your frontend domain exactly.

### Authentication Errors
Check Clerk API keys are correct for the environment (test vs live).

### Image Upload Failures
Verify Cloudinary credentials and check upload limits.

### Database Connection Issues
Check MongoDB connection string and network access settings.

---

## Alternative Deployment Options

### Railway (Backend)
1. Create railway.app account
2. Create new project from GitHub
3. Add environment variables
4. Deploy

### Netlify (Frontend)
1. Create netlify.com account
2. Import from GitHub
3. Set build command: `cd client && npm run build`
4. Set publish directory: `client/dist`
5. Add environment variables

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Render
1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

## SSL/HTTPS

Both Vercel and Render provide automatic SSL certificates for all deployments.

---

## Scaling Considerations

For production with high traffic:

1. **Database:** Upgrade MongoDB Atlas tier
2. **Backend:** Use paid Render/Railway plan
3. **CDN:** Consider Cloudflare for static assets
4. **Caching:** Implement Redis for session caching
5. **Rate Limiting:** Add express-rate-limit middleware
