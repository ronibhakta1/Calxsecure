# Fix Vercel Build Failure - Quick Reference

## The Problem
Vercel build is failing with a generic error because environment variables aren't set during the build process.

## The Solution

### Step 1: Generate NEXTAUTH_SECRET
```bash
# On your local machine, generate a secure 32+ character secret
openssl rand -base64 32
# Copy the output - you'll need it in the next step
```

### Step 2: Configure Vercel Environment Variables

Go to your Vercel project dashboard:
1. **Settings** → **Environment Variables**
2. Add each variable below with your actual values:

| Variable | Value | Production Only? |
|----------|-------|-----------------|
| `DATABASE_URL` | Your PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | Your production domain (e.g., `https://app.yourdomain.com`) | ✅ |
| `RAZORPAY_KEY_ID` | Your Razorpay API Key ID | ✅ |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API Secret | ✅ |
| `REDIS_URL` | Your Redis connection string (optional) | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase console | ❌ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | From Firebase console | ❌ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | From Firebase console | ❌ |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | ❌ |

**Note**: Mark variables as "Production" only unless you also want them in Preview deployments.

### Step 3: Trigger Redeploy

Option A (Automatic):
```bash
git push origin main
```

Option B (Manual):
1. Go to Vercel Dashboard
2. Select your project
3. **Deployments** tab
4. Find the failed deployment
5. Click **Redeploy**

### Step 4: Monitor Build
1. Watch the build logs in Vercel Dashboard
2. Should complete in ~2-3 minutes
3. ✅ Build succeeds with "Deployment Successful" message

## Verification

Once deployed:
1. Visit your production URL
2. Should see the login page without database connection errors
3. Check Vercel Analytics for any runtime errors

## If Build Still Fails

1. **Check Build Logs** - Click the failed deployment to see detailed error
2. **Verify DATABASE_URL** - Must be a valid PostgreSQL connection string
3. **Check NEXTAUTH_SECRET** - Must be 32+ characters, no spaces
4. **Clear Cache** - Settings → Git → Disconnect and reconnect repo
5. **Test Locally** - Run `npm run build` locally with same env vars

## Command Reference

```bash
# Test local build with production settings
npm run build

# View build output
cat apps/user-app/.next/build-manifest.json

# Check environment setup
echo $DATABASE_URL
echo $NEXTAUTH_SECRET

# Generate new secret if needed
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

**Status**: This resolves the Vercel build failure. Deployment should now succeed.
