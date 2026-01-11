# NC Issues - North Carolina Legislative Tracking

A Next.js application for tracking North Carolina legislation with Supabase backend, designed for Vercel deployment.

## Features

- **Bill Tracking**: Browse and search NC House and Senate bills
- **Smart Subscriptions**: Subscribe to topics and municipalities for personalized notifications
- **Blog Platform**: Legislative analysis and updates
- **Contact Representatives**: Send messages to legislators about bills
- **Supabase Auth**: Secure authentication with OAuth providers
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL database + Auth)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with custom NC-themed design system

## Database Schema

The Supabase database includes:
- `profiles` - User profiles extending Supabase auth
- `bills` - Legislative bills with full tracking
- `bill_history` - Bill action timeline
- `legislators` - NC House and Senate members
- `subscriptions` - User notification preferences
- `notifications` - Notification queue and history
- `blog_posts` - Content management
- `contact_messages` - Legislator communications
- `calendar_events` - Legislative calendar
- `scraping_logs` - Data collection tracking

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/AIRealSolutions/ncissues-app.git
cd ncissues-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bmwzjybppjneyejlsjpv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Via Vercel Dashboard

1. Push code to GitHub repository: `AIRealSolutions/ncissues-app`
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import the GitHub repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://bmwzjybppjneyejlsjpv.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (from Supabase dashboard)
6. Click "Deploy"

## Supabase Configuration

**Project ID**: `bmwzjybppjneyejlsjpv`
**Region**: us-east-2
**Database**: PostgreSQL 17

### Enable Authentication

1. Go to Supabase dashboard → Authentication → Providers
2. Enable OAuth providers (Google, GitHub, etc.)
3. Configure redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.vercel.app/auth/callback`

## Project Structure

```
ncissues-nextjs/
├── app/
│   ├── api/              # API routes
│   │   ├── bills/        # Bills endpoints
│   │   ├── subscriptions/# Subscription endpoints
│   │   ├── blog/         # Blog endpoints
│   │   └── contact/      # Contact endpoints
│   ├── bills/            # Bills pages
│   ├── subscribe/        # Subscription page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/
│   └── supabase/         # Supabase client utilities
├── types/
│   └── database.ts       # TypeScript types
└── middleware.ts         # Auth middleware
```

## License

MIT License
