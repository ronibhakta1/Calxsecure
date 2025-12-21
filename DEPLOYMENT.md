# Vercel Deployment Guide

## Prerequisites

1. Vercel account and project connected to your GitHub repository
2. All environment variables properly configured in Vercel project settings

## Required Environment Variables

Set these in your Vercel Project Settings → Environment Variables:

### Database
- `DATABASE_URL` - PostgreSQL connection string (e.g., from Prisma Data Platform or your own database)

### Authentication
- `NEXTAUTH_SECRET` - Random 32+ character string for JWT encryption
  - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production domain (e.g., `https://yourdomain.vercel.app`)

### Payment Processing
- `RAZORPAY_KEY_ID` - Your Razorpay API key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay API secret key

### Caching (Optional)
- `REDIS_URL` - Redis connection string (for session/cache management)

### Firebase (Public - can be in .env.example)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix: Update environment variables for Vercel deployment"
   git push origin main
   ```

2. **Configure Vercel Project**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all required variables from the section above
   - Make sure to set them for "Production" environment

3. **Trigger Deployment**
   - Vercel will automatically deploy when you push to your main branch
   - Or manually redeploy from Vercel Dashboard

## Troubleshooting Build Failures

### Generic "build failed" error
- Check Vercel Build Logs for detailed errors
- Ensure all required environment variables are set
- Verify `NEXTAUTH_SECRET` is at least 32 characters

### Database Connection Errors
- Verify `DATABASE_URL` format and connectivity from Vercel servers
- If using Prisma Data Platform, ensure IP whitelist includes Vercel's IP ranges
- Check database user permissions

### Module Not Found Errors
- Clear Vercel cache and redeploy
- Dashboard → Settings → Git → Disconnect and reconnect repo

## Local Development

```bash
# Copy environment template
cp .env.example apps/user-app/.env.local

# Update with your local values
# Then run
npm install
npm run dev
```

Note: `.env.local` and actual `.env` files are git-ignored for security.
