# Anchor

An emotion-aware productivity application that combines habit tracking and task management with AI-driven decision making to help users build long-term productive routines without guilt or burnout.

## 🌟 Key Features

- **Identity-Based Streaks**: Build habits around who you want to be, not just what you want to do
- **Mandatory Daily Emotional Check-ins**: Track your emotional state to enable adaptive support
- **AI Decision Engine**: Google Gemini-powered system that adjusts pressure and support based on emotional context
- **No Guilt Messaging**: Optimized for long-term consistency over short-term intensity
- **Adaptive Streak States**: Normal, recovery, and protected modes for different life phases
- **Email Notifications**: Supportive, emotion-aware communications
- **Comprehensive Observability**: Track AI decisions, outcomes, and user patterns

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email-based)
- **AI Models**: Google Gemini (Flash-Lite, Flash, Pro)
- **Observability**: Structured logging for AI decisions and outcomes
- **Notifications**: Email only (production-focused)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google AI API key

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the database migrations in order:
   - Execute `database/migrations/001_initial_schema.sql` in your Supabase SQL editor
   - Execute `database/migrations/002_functions_triggers.sql` in your Supabase SQL editor
3. Generate TypeScript types: `npm run db:generate-types`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

### Core Tables

- **users**: User profiles with timezone and metadata
- **streaks**: Identity-based habit streaks with adaptive states
- **emotion_checkins**: Daily emotional check-ins (mandatory)
- **habits**: Habits linked to streaks with difficulty levels
- **tasks**: Daily productivity tasks with effort estimates
- **habit_completions**: Track habit completion history
- **ai_decisions**: Log all AI decisions for observability
- **notifications**: Email notifications sent to users
- **user_analytics**: Daily aggregated user metrics

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic Triggers**: Streak counts update automatically on habit completion
- **Database Functions**: Helper functions for AI context gathering
- **Performance Indexes**: Optimized for common query patterns

## 🤖 AI Decision System

### Core Principles

1. **No guilt-based messaging** - Focus on long-term consistency
2. **Emotion-aware adaptation** - Adjust pressure based on user's emotional state
3. **Explainable decisions** - All decisions logged with reasoning
4. **Multiple intervention types** - Pressure adjustment, streak state changes, notifications

### Decision Types

- **pressure_adjustment**: Modify habit difficulty or task effort
- **streak_state_change**: Change streak state (normal/recovery/protected)
- **notification**: Send supportive email
- **task_modification**: Adjust today's task estimates
- **no_action**: Sometimes the best action is no action

### AI Models

- **Gemini Flash-Lite**: Routine reasoning (fast, cost-effective)
- **Gemini Flash**: Complex decisions (balanced performance)
- **Gemini Pro**: Critical decisions (highest quality)

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard page
│   ├── login/                # Authentication pages
│   └── register/
├── components/               # React components
│   ├── ui/                   # Base UI components
│   ├── forms/                # Form components
│   └── dashboard/            # Dashboard-specific components
├── lib/                      # Core libraries
│   ├── ai/                   # AI decision engine
│   ├── auth/                 # Authentication helpers
│   ├── database/             # Database utilities
│   ├── observability/        # Logging and monitoring
│   └── utils/                # General utilities
└── types/                    # TypeScript type definitions

database/
├── schema.sql                # Complete database schema
└── migrations/               # Migration files
```

## 🔐 Authentication Flow

1. **Email-based registration** with email verification
2. **Session management** via Supabase Auth
3. **Middleware protection** for authenticated routes
4. **Automatic user creation** in the users table
5. **Row Level Security** for data isolation

## 📝 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `POST /api/auth/logout` - User logout

### Core Features
- `GET|POST /api/emotions` - Emotion check-ins
- `GET|POST /api/streaks` - Streak management
- `GET|POST /api/habits` - Habit management
- `POST /api/habits/[id]/complete` - Complete habits
- `GET /api/dashboard` - Dashboard data
- `POST /api/ai/decision` - Trigger AI decisions

## 🎯 User Journey

1. **Registration**: Create account with email verification
2. **Onboarding**: Set up first identity-based streak
3. **Daily Check-in**: Mandatory emotional state selection
4. **Habit Building**: Create and complete habits linked to streaks
5. **AI Adaptation**: System learns and adapts to user patterns
6. **Long-term Growth**: Focus on consistency over perfection

## 🏃‍♂️ Development Commands

```bash
# Development
npm run dev                   # Start development server
npm run build                 # Build for production
npm run start                 # Start production server

# Code Quality
npm run lint                  # Run ESLint
npm run type-check            # TypeScript type checking

# Database
npm run db:generate-types     # Generate TypeScript types from Supabase
```

## 🚢 Deployment

This application is designed for production deployment on platforms like Vercel, Netlify, or similar Next.js-compatible platforms.

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Supabase credentials
- Google AI API key
- App URL (for proper redirects)

### Database Migrations

Run the migration files in your production Supabase instance in the correct order.

## 🔍 Observability

All AI decisions are logged with:
- Context (emotion, streaks, habits, tasks)
- Decision reasoning and confidence
- Execution time and model used
- Outcomes and effectiveness

This enables:
- A/B testing different prompt versions
- Model performance comparison
- User experience optimization
- Decision quality evaluation

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Ensure TypeScript types are properly defined
3. Add proper error handling and logging
4. Test AI decision scenarios thoroughly
5. Maintain the calm, supportive UI tone

## 📄 License

This project is built as a production-quality SaaS application. Ensure proper licensing for commercial use.

---

**Built with ❤️ for mental health-friendly productivity**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
