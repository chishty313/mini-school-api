# Backend API Deployment Guide

This guide will walk you through deploying the Mini School Management API to Vercel.

## Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Neon Database**: Set up a PostgreSQL database at [neon.tech](https://neon.tech)

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository

```bash
cd mini-school-api
git init
git add .
git commit -m "Initial commit: Mini School Management API"
```

### 1.2 Create GitHub Repository

1. Go to GitHub and create a new repository named `mini-school-api`
2. Don't initialize with README (you already have one)
3. Copy the repository URL

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/yourusername/mini-school-api.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Neon Database

### 2.1 Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 2.2 Get Database Connection Details

1. In your Neon dashboard, go to "Connection Details"
2. Copy the following information:
   - Host
   - Database name
   - Username
   - Password
   - Port (usually 5432)

### 2.3 Run Database Migrations (Local)

```bash
# Install dependencies
npm install

# Run migrations (you'll need to set up .env first)
npm run db:migrate
```

## Step 3: Deploy to Vercel

### 3.1 Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `mini-school-api` repository

### 3.2 Configure Project

1. **Project Name**: `mini-school-api` (or your preferred name)
2. **Framework Preset**: Other
3. **Root Directory**: `./` (leave as default)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### 3.3 Set Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```bash
# Database Configuration
DB_HOST=your-neon-db-host
DB_PORT=5432
DB_USER=your-neon-db-user
DB_PASSWORD=your-neon-db-password
DB_NAME=your-neon-db-name

# JWT Configuration (generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Environment
NODE_ENV=production

# CORS (update after frontend deployment)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Important**: Generate strong JWT secrets:

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note the deployment URL (e.g., `https://mini-school-api-abc123.vercel.app`)

## Step 4: Test Your Deployment

### 4.1 Test API Endpoints

1. Visit your API URL
2. You should see: `{"message":"Mini School API is running!","timestamp":"..."}`

### 4.2 Test Database Connection

1. Try registering a new user:

   ```bash
   curl -X POST https://your-api-url.vercel.app/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Admin",
       "email": "admin@test.com",
       "password": "TestPass123!",
       "role": "admin"
     }'
   ```

2. Check your Neon dashboard to see if the user was created

### 4.3 Test Authentication

1. Try logging in:
   ```bash
   curl -X POST https://your-api-url.vercel.app/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@test.com",
       "password": "TestPass123!"
     }'
   ```

## Step 5: Update CORS Configuration

After deploying your frontend, update the `FRONTEND_URL` environment variable in Vercel:

1. Go to your Vercel project settings
2. Go to Environment Variables
3. Update `FRONTEND_URL` with your actual frontend URL
4. Redeploy the project

## Environment Variables Reference

| Variable             | Description          | Example                              |
| -------------------- | -------------------- | ------------------------------------ |
| `DB_HOST`            | Neon database host   | `ep-xxx-xxx.us-east-1.aws.neon.tech` |
| `DB_PORT`            | Database port        | `5432`                               |
| `DB_USER`            | Database username    | `neondb_owner`                       |
| `DB_PASSWORD`        | Database password    | `your-password`                      |
| `DB_NAME`            | Database name        | `neondb`                             |
| `JWT_SECRET`         | JWT signing secret   | `64-character-hex-string`            |
| `JWT_REFRESH_SECRET` | Refresh token secret | `64-character-hex-string`            |
| `NODE_ENV`           | Environment          | `production`                         |
| `FRONTEND_URL`       | Frontend domain      | `https://your-frontend.vercel.app`   |

## Troubleshooting

### Common Issues

#### 1. Build Failures

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

#### 2. Database Connection Issues

- Verify environment variables are set correctly
- Check Neon database is running
- Verify connection string format

#### 3. CORS Issues

- Ensure `FRONTEND_URL` is set correctly
- Check CORS configuration in code
- Verify frontend URL matches exactly

#### 4. Authentication Issues

- Verify JWT secrets are set
- Check token expiration settings
- Ensure secrets are strong enough

### Getting Help

1. Check Vercel deployment logs
2. Check function logs in Vercel dashboard
3. Verify environment variables
4. Test API endpoints directly
5. Check Neon database logs

## Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Neon database set up
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] API deployed successfully
- [ ] Health check endpoint working
- [ ] User registration working
- [ ] User login working
- [ ] Database connection verified
- [ ] CORS configured (after frontend deployment)

## Next Steps

After successful deployment:

1. **Note the API URL**: You'll need this for frontend deployment
2. **Test all endpoints**: Verify all API functionality
3. **Monitor performance**: Keep an eye on function execution
4. **Set up monitoring**: Consider adding error tracking

Your backend API is now live! 🚀

## API Documentation

Once deployed, your API will be available at:

- **Base URL**: `https://your-api-url.vercel.app`
- **Health Check**: `GET /`
- **Documentation**: Check the README.md for endpoint details
