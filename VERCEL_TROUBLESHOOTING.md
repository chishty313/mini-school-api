# Vercel Deployment Troubleshooting Guide

## Issue: "Network Error" when trying to login from frontend

### Root Cause Analysis
The backend deployment was failing with `FUNCTION_INVOCATION_FAILED` error, preventing the API from responding to requests.

### Fixes Applied

#### 1. **Vercel Configuration Fix**
**Problem**: `vercel.json` was pointing to wrong entry point
```json
// Before (incorrect)
{
  "builds": [{"src": "src/index.ts", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "src/index.ts"}]
}

// After (correct)
{
  "builds": [{"src": "api/index.ts", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "api/index.ts"}]
}
```

#### 2. **API Entry Point Fix**
**Problem**: `api/index.ts` was not properly handling Vercel serverless functions
```typescript
// Before (basic)
import app from '../src/app';
export default app;

// After (with error handling)
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { default: app } = await import('../src/app');
    return app(req, res);
  } catch (error) {
    console.error('Error importing app:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to start application',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
```

#### 3. **Environment Variable Debugging**
**Problem**: Added better error reporting for missing environment variables
```typescript
// Enhanced error reporting
console.error('Available environment variables:', Object.keys(process.env));
```

### Verification Steps

#### 1. **Check Backend Deployment Status**
Wait 2-3 minutes for Vercel to redeploy, then test:
```bash
# Test if backend is responding
curl -X GET https://mini-school-api.vercel.app/

# Expected response: JSON with API information
```

#### 2. **Check Vercel Function Logs**
1. Go to Vercel Dashboard
2. Select backend project: `mini-school-api`
3. Go to Functions tab
4. Check for any error logs
5. Look for specific error messages

#### 3. **Test API Endpoints**
```bash
# Test health endpoint
curl -X GET https://mini-school-api.vercel.app/

# Test login endpoint
curl -X POST https://mini-school-api.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"AdminPass123!"}'
```

#### 4. **Check Environment Variables**
In Vercel Dashboard → Settings → Environment Variables, verify:
- [ ] `FRONTEND_URL=https://nextjs-mini-school-management-syste.vercel.app`
- [ ] `DB_HOST=ep-holy-dream-a1rqc1pt-pooler.ap-southeast-1.aws.neon.tech`
- [ ] `DB_NAME=neondb`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DB_PORT=5432`
- [ ] `DB_USER=neondb_owner`
- [ ] `DB_PASSWORD=npg_krY4v5dfBVbO`
- [ ] `JWT_ACCESS_SECRET=5776d435b61ca1c4b23133422c07feb22af1f7dd77e107b9b6c452b7c736934bfd1096b2adac7878b0dcb25639215ba88e08a5855a2997a0f521e0e07391e69c`
- [ ] `JWT_REFRESH_SECRET=1278f0ffdf6ea6e2bc60c45a1fddae3b7119fdb7a07153031a3311741c3df3d0fdd622e3bd6941b0581cdc72d7aa77643e64065750c60877c36a35492d48c55a`
- [ ] `JWT_ACCESS_EXPIRES_IN=1h`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`

### Common Issues & Solutions

#### Issue 1: FUNCTION_INVOCATION_FAILED
**Error**: `A server error has occurred FUNCTION_INVOCATION_FAILED`

**Solutions**:
1. Check Vercel function logs for specific error
2. Verify all environment variables are set
3. Ensure database connection is working
4. Check if JWT secrets are properly formatted

#### Issue 2: Environment Variable Issues
**Error**: Missing required environment variables

**Solutions**:
1. Double-check all environment variables in Vercel dashboard
2. Ensure no extra spaces or special characters
3. Verify database credentials are correct
4. Test database connection separately

#### Issue 3: Database Connection Issues
**Error**: Database connection failed

**Solutions**:
1. Verify Neon database is accessible
2. Check database credentials
3. Ensure SSL is enabled for production
4. Test database connection with a simple query

#### Issue 4: CORS Issues
**Error**: CORS policy blocking requests

**Solutions**:
1. Verify frontend URL is in CORS origins
2. Check if backend is responding to OPTIONS requests
3. Ensure credentials are properly configured

### Testing Workflow

#### 1. **Backend Health Check**
```bash
curl -X GET https://mini-school-api.vercel.app/
```
**Expected**: JSON response with API information

#### 2. **Login Test**
```bash
curl -X POST https://mini-school-api.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"AdminPass123!"}'
```
**Expected**: JSON response with user data and tokens

#### 3. **Frontend Integration Test**
1. Open frontend: `https://nextjs-mini-school-management-syste.vercel.app`
2. Try to login with admin credentials
3. Check browser console for errors
4. Verify successful redirect to dashboard

### Debugging Tools

#### 1. **Browser Developer Tools**
- Open DevTools (F12)
- Go to Network tab
- Try login
- Check for failed requests (red status)
- Look at response headers and body

#### 2. **Vercel Function Logs**
- Vercel Dashboard → Functions tab
- Look for error logs
- Check execution time and memory usage

#### 3. **Database Connection Test**
```bash
# Test database connection
curl -X GET https://mini-school-api.vercel.app/test-db
```

### Success Indicators
- ✅ Backend responds to health check
- ✅ Login endpoint returns 200 with tokens
- ✅ No CORS errors in browser console
- ✅ Frontend successfully authenticates
- ✅ Dashboard loads after login

### Timeline
- **Backend redeployment**: 2-3 minutes
- **Testing**: After deployment completes
- **Full resolution**: Within 5-10 minutes

### If Issues Persist

1. **Check Vercel Status**: Visit [Vercel Status Page](https://vercel-status.com/)
2. **Review Function Logs**: Look for specific error messages
3. **Test Database**: Verify Neon database is accessible
4. **Environment Variables**: Double-check all variables are set correctly
5. **Contact Support**: If all else fails, contact Vercel support with function logs

The fixes applied should resolve the `FUNCTION_INVOCATION_FAILED` error and restore API functionality.
