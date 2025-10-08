# 🚀 Land ReGen Deployment Guide

## Backend Deployment (Render)

### 1. Create Render Account
- Go to [render.com](https://render.com) and sign up
- Connect your GitHub account

### 2. Deploy Backend
1. Push your code to GitHub
2. In Render dashboard, click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: `land-regen-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Environment Variables
Add these in Render dashboard:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=production
```

## Frontend Deployment (Vercel/Netlify)

### Option 1: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. In frontend folder: `vercel`
3. Follow prompts

### Option 2: Netlify
1. Build: `npm run build`
2. Drag `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)

## Update API URLs
After backend deployment, update `frontend/src/config/api.js`:
```js
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.onrender.com'
  : 'http://localhost:3000';
```

## Database Setup (Supabase)
Run this SQL in Supabase SQL Editor:
```sql
-- Add reset token columns to users table
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_expiry TIMESTAMPTZ;
```

## 🎯 Deployment Checklist
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel/Netlify
- [ ] API URLs updated
- [ ] Database schema updated
- [ ] Email service configured
- [ ] CORS origins updated
- [ ] Test all functionality

## 🔗 Live URLs
- **Backend**: https://land-regen-backend.onrender.com
- **Frontend**: https://land-regen-dashboard.vercel.app
- **Health Check**: https://land-regen-backend.onrender.com/health