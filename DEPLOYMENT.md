# Deployment Guide

## Prerequisites

1. GitHub account
2. Vercel account (free tier works)
3. PostgreSQL database (we'll use Vercel Postgres)

## Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete scheduler app"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/scheduler-app.git
git branch -M main
git push -u origin main
```

## Step 2: Set up Vercel Postgres

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Storage" in the dashboard
4. Click "Create Database"
5. Select "Postgres"
6. Choose a name (e.g., "scheduler-db")
7. Select a region close to your users
8. Click "Create"

## Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:

```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

6. Connect Vercel Postgres:
   - In your Vercel project settings
   - Go to "Storage"
   - Connect the Postgres database you created
   - This will automatically add `DATABASE_URL` environment variable

7. Click "Deploy"

## Step 4: Run Database Migrations

After deployment:

1. Go to your Vercel project settings
2. Click on "Deployments"
3. Click on the latest deployment
4. Click "..." → "Redeploy"
5. Check "Use existing Build Cache"
6. The `postinstall` script will run `prisma generate` automatically

Alternatively, use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.local
npx prisma db push
```

## Step 5: Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials"
5. Create OAuth 2.0 Client ID
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local)
   - `https://your-app-name.vercel.app/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret
8. Add to Vercel environment variables

## Step 6: Verify Deployment

1. Visit your deployed app: `https://your-app-name.vercel.app`
2. Test sign-up/sign-in
3. Create a task
4. Create a schedule
5. Check analytics

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Check that `DATABASE_URL` is set in Vercel environment variables
2. Verify the database is in the same region as your Vercel deployment
3. Check Vercel Postgres dashboard for connection details

### Build Failures

If build fails:

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript types are correct
4. Run `npm run build` locally to test

### Authentication Issues

If authentication doesn't work:

1. Verify `NEXTAUTH_URL` matches your deployment URL
2. Check `NEXTAUTH_SECRET` is set
3. For Google OAuth, verify redirect URIs are correct
4. Check browser console for errors

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to use custom domain

## Monitoring

- View logs in Vercel dashboard
- Set up error tracking (e.g., Sentry)
- Monitor database usage in Vercel Postgres dashboard

## Updating the App

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push

# Vercel will automatically deploy
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Your app URL | Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |

## Success! 🎉

Your Scheduler App is now live and ready to use!
