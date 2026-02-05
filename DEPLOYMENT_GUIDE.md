# Anchor Deployment Guide

Complete step-by-step guide to set up, configure, and deploy the Anchor application.

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] **Node.js 18+** and npm installed
- [ ] **Git** for version control
- [ ] **Supabase account** (free tier is sufficient)
- [ ] **Google AI Platform account** for Gemini API
- [ ] **Email service** (optional, for production notifications)
- [ ] **Vercel/Netlify account** for deployment (optional)

---

## 🔧 Step 1: Development Environment Setup

### 1.1 Clone and Install Dependencies

```bash
# Navigate to project directory
cd C:\Users\LENOVO\Desktop\Anchor

# Install all dependencies
npm install

# Verify installation
npm run type-check
```

### 1.2 Environment Configuration

1. **Copy environment template:**
   ```bash
   copy .env.local.example .env.local
   ```

2. **Open `.env.local`** and prepare to fill in the values in the following steps.

---

## 🗄️ Step 2: Database Setup (Supabase)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose organization and fill in:
   - **Name**: `anchor-production` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for initialization (~2 minutes)

### 2.2 Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values to your `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 2.3 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste the contents of `database/migrations/001_initial_schema.sql`
3. Click **"Run"** to execute
4. Create another new query and paste the contents of `database/migrations/002_functions_triggers.sql`  
5. Click **"Run"** to execute
6. Verify tables were created in **Database** → **Tables**

### 2.4 Generate TypeScript Types

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Generate types (replace with your project ID)
npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

---

## 🤖 Step 3: Google AI (Gemini) Setup

### 3.1 Get Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **"Get API key"**
3. Create a new API key or use existing one
4. Copy the API key to your `.env.local`:
   ```bash
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   ```

### 3.2 Test AI Integration

```bash
# Start development server
npm run dev

# Test API endpoint (in another terminal)
curl -X POST http://localhost:3000/api/ai/decision \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 🚀 Step 4: Local Development

### 4.1 Complete Environment Variables

Update your `.env.local` with all required values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Email Configuration (optional for development)
EMAIL_FROM=noreply@anchor.app

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4.2 Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### 4.3 Test Core Functionality

1. **Register a new account** at `/register`
2. **Check email** for verification link (check Supabase Auth logs if needed)
3. **Complete login** at `/login`
4. **Complete emotion check-in** (mandatory first step)
5. **Explore dashboard** functionality

---

## 📊 Step 5: Set up Observability (Optional)

### 5.1 Basic Logging Setup

The application already includes comprehensive logging to the database for AI decisions. For enhanced observability:

```bash
# Add logging utilities
npm install winston
```

Create `src/lib/observability/logger.ts`:

```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

### 5.2 Alternative Observability Platforms

Since Comet Opik wasn't available, consider these alternatives:

- **Vercel Analytics** (if deploying to Vercel)
- **Sentry** for error tracking
- **PostHog** for product analytics
- **DataDog** for enterprise monitoring

---

## 🌐 Step 6: Production Deployment

### 6.1 Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Anchor application setup"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click **"New Project"** 
   - Select your Anchor repository
   - Configure environment variables (copy from `.env.local`)
   - Click **"Deploy"**

3. **Update App URL:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

### 6.2 Deploy to Netlify (Alternative)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag the `out` folder to [netlify.com/drop](https://netlify.com/drop)
   - Or connect your GitHub repository
   - Configure environment variables
   - Set build command: `npm run build`
   - Set publish directory: `out`

---

## 📧 Step 7: Email Configuration (Production)

### 7.1 Choose Email Service

For production notifications, integrate an email service:

- **Resend** (recommended for developers)
- **SendGrid** (reliable, scalable)
- **Amazon SES** (cost-effective)
- **Mailgun** (feature-rich)

### 7.2 Example: Resend Setup

```bash
npm install resend
```

Create `src/lib/email/resend.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  return await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@anchor.app',
    to,
    subject,
    html,
  })
}
```

---

## 🔧 Step 8: Post-Deployment Configuration

### 8.1 Configure Supabase for Production

1. **Update Site URL** in Supabase:
   - Go to **Authentication** → **Settings**
   - Update **Site URL** to your production domain
   - Add production domain to **Redirect URLs**

2. **Configure RLS Policies:**
   - Verify Row Level Security is enabled on all tables
   - Test user access with a production account

### 8.2 Performance Optimization

1. **Enable caching headers**
2. **Configure CDN** (Vercel/Netlify handle this automatically)
3. **Monitor database performance** in Supabase dashboard
4. **Set up database backups**

---

## ✅ Step 9: Testing & Validation

### 9.1 User Journey Testing

Test the complete user flow:

1. ✅ **Landing page** loads correctly
2. ✅ **User registration** with email verification
3. ✅ **Login flow** works smoothly  
4. ✅ **Emotion check-in** is mandatory and functional
5. ✅ **Dashboard** displays correctly
6. ✅ **Create streak** functionality works
7. ✅ **Add habits** to streaks
8. ✅ **Complete habits** updates streaks
9. ✅ **AI decisions** are triggered and logged
10. ✅ **User data** is properly isolated (RLS working)

### 9.2 Performance Testing

```bash
# Install testing tools
npm install -D @playwright/test

# Run performance tests
npm run test:e2e
```

---

## 📊 Step 10: Monitoring & Maintenance

### 10.1 Set Up Monitoring

1. **Database monitoring** via Supabase dashboard
2. **Application performance** via Vercel/Netlify analytics
3. **Error tracking** via browser dev tools or Sentry
4. **User feedback** collection system

### 10.2 Regular Maintenance Tasks

- **Weekly**: Check error logs and user feedback
- **Monthly**: Review AI decision quality and user patterns  
- **Quarterly**: Database performance optimization
- **As needed**: Update dependencies and security patches

---

## 🆘 Troubleshooting

### Common Issues:

1. **"Unauthorized" errors**: Check RLS policies and authentication
2. **AI decisions failing**: Verify Google AI API key and quota
3. **Database connection issues**: Check Supabase credentials
4. **Email verification not working**: Check Supabase Auth settings
5. **Build failures**: Run `npm run type-check` locally first

### Debug Commands:

```bash
# Check environment variables
npm run dev -- --inspect

# Validate database connection
npm run type-check

# Check build output
npm run build

# View logs (if using file logging)
tail -f combined.log
```

---

## 🎉 Success!

Once all steps are completed, you'll have a fully functional, production-ready Anchor application that helps users build sustainable habits through emotion-aware AI support.

**Key URLs:**
- **Production App**: https://your-app.vercel.app
- **Supabase Dashboard**: https://app.supabase.com/projects/your-project-id
- **Google AI Console**: https://aistudio.google.com/

**Next Steps:**
- Monitor user adoption and feedback
- Iterate on AI prompt effectiveness  
- Add advanced features like habit recommendations
- Scale infrastructure as user base grows

---

*Built with ❤️ for sustainable productivity*