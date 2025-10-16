# Render.com Deployment Checklist

## Pre-deployment Steps

### 1. Environment Variables Setup
Make sure to add these environment variables in your Render dashboard:

#### Required:
- [ ] `DATABASE_URL` - Will be automatically set when you create a PostgreSQL database
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Will be automatically set by Render (usually 10000)

#### AI API Keys (at least one required):
- [ ] `ANTHROPIC_API_KEY` - Your Anthropic Claude API key
- [ ] `OPENAI_API_KEY` - Your OpenAI API key  
- [ ] `GEMINI_API_KEY` - Your Google Gemini API key (optional)

#### Google Cloud Storage (if using file uploads):
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` - Paste the entire service account JSON
- [ ] `GOOGLE_CLOUD_PROJECT_ID` - Your Google Cloud project ID
- [ ] `GOOGLE_CLOUD_STORAGE_BUCKET` - Your storage bucket name

#### Optional:
- [ ] `SESSION_SECRET` - Random string for session security

### 2. GitHub Repository
- [ ] Push all your code to GitHub
- [ ] Make sure `.env` files are not committed (check `.gitignore`)
- [ ] Verify `render.yaml` is in the root directory
- [ ] Check that `package.json` has correct build scripts

### 3. Database Preparation
- [ ] Review your database schema in `shared/schema.ts`
- [ ] Test database migrations locally if you have any

## Deployment Steps

### 1. Create Render Account
- [ ] Sign up at https://render.com
- [ ] Connect your GitHub account

### 2. Create PostgreSQL Database
- [ ] Go to "New" → "PostgreSQL"
- [ ] Name: `visionthread-db`
- [ ] Plan: Choose based on your needs (Starter for testing)
- [ ] Create database

### 3. Create Web Service
- [ ] Go to "New" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Service name: `visionthread`
- [ ] Runtime: Node
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Plan: Choose based on your needs

### 4. Configure Environment Variables
- [ ] In your web service settings, go to "Environment"
- [ ] Add all the environment variables listed above
- [ ] Link the database by adding `DATABASE_URL` from your PostgreSQL service

### 5. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for the build and deployment to complete
- [ ] Check the logs for any errors

## Post-deployment Verification

### 1. Health Checks
- [ ] Visit your app URL - should show the React frontend
- [ ] Visit `your-app-url.com/health` - should return JSON with status
- [ ] Check that API endpoints respond correctly

### 2. Database
- [ ] Verify database connection is working
- [ ] Run any necessary database migrations
- [ ] Test creating/reading data

### 3. AI Integration
- [ ] Test image upload and analysis
- [ ] Verify AI providers are working
- [ ] Check fallback between different AI providers

### 4. File Uploads (if applicable)
- [ ] Test image upload functionality
- [ ] Verify Google Cloud Storage integration
- [ ] Check file access and permissions

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version, dependencies, and build scripts
2. **Database connection**: Verify DATABASE_URL is correctly set
3. **API keys**: Ensure all required API keys are properly configured
4. **File uploads**: Check Google Cloud credentials and bucket permissions

### Useful Commands:
```bash
# Check logs in Render dashboard
# Or connect via Render shell if needed

# Database migration (if needed)
npm run db:push

# Check environment variables
echo $DATABASE_URL
```

### Support:
- Render Documentation: https://render.com/docs
- Check application logs in Render dashboard
- GitHub Issues: Create issues in your repository
