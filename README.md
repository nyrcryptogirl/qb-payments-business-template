# QuickBooks Payments Business Template

A complete, ready-to-deploy business website with integrated QuickBooks Payments. Built with Next.js 14, Vercel Postgres, and the QuickBooks Online API.

## What This Template Includes

### Public Website
- **Landing Page** — Hero section, services, testimonials, contact info, CTA
- **Services Page** — All services with pricing (editable from admin)
- **Checkout Page** — Accept Cards, ACH/eCheck, Apple Pay, Google Pay
- **Fully Responsive** — Works on desktop, tablet, and mobile

### Admin Dashboard
- **Dashboard** — Revenue overview, recent transactions, QB connection status
- **Customers** — All customer records (synced with QuickBooks)
- **Charge Customer** — Process payments directly from the admin panel
- **Payments** — Full transaction history with status tracking
- **Invoices** — Auto-created and synced with QuickBooks
- **Site Settings** — Customize EVERYTHING from the browser:
  - Business name, tagline, phone, email, address
  - Logo (URL-based)
  - Primary and accent colors with live preview
  - Add/edit/remove services with pricing
  - Add/edit/remove testimonials
  - Enable/disable payment methods
  - Checkout page text
  - Social media links and footer
  - QuickBooks connect/disconnect

### QuickBooks Integration
- **OAuth 2.0** — Secure Connect to QuickBooks flow
- **Payments API** — Tokenize cards/banks, process charges
- **Accounting API** — Auto-create customers, invoices, and payment records
- **Auto Token Refresh** — Tokens refresh automatically when expired

## Deployment Guide (Step by Step)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Click **Deploy** (it will fail first time — that's OK, we need to add env vars)

### Step 3: Add Vercel Postgres
1. In your Vercel project, go to **Storage** tab
2. Click **Create Database** > **Postgres**
3. Follow the setup — this auto-adds the `POSTGRES_URL` env vars

### Step 4: Add Environment Variables
In Vercel project > **Settings** > **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_URL` | `https://your-app.vercel.app` |
| `QB_CLIENT_ID` | Your Intuit Developer Client ID |
| `QB_CLIENT_SECRET` | Your Intuit Developer Client Secret |
| `QB_REDIRECT_URI` | `https://your-app.vercel.app/api/quickbooks/callback` |
| `QB_ENVIRONMENT` | `sandbox` (change to `production` when ready) |
| `JWT_SECRET` | Random string (run `openssl rand -base64 32`) |

### Step 5: Set Redirect URI in Intuit
1. Go to [developer.intuit.com](https://developer.intuit.com)
2. Open your app > **Settings**
3. Add this Redirect URI: `https://your-app.vercel.app/api/quickbooks/callback`
4. Save

### Step 6: Initialize Database
After your first deploy with Postgres connected:

1. Visit `https://your-app.vercel.app/login`
2. You'll see a "First Time Setup" screen
3. Click **"Initialize Database"** — this creates all tables automatically
4. Then proceed to create your admin account

### Step 7: Create Admin Account
1. Visit `https://your-app.vercel.app/login`
2. Click "Create admin account"
3. Enter your email, name, and password
4. You're in!

### Step 8: Connect QuickBooks
1. In Admin > Settings > QuickBooks tab
2. Click "Connect to QuickBooks"
3. Authorize with your QuickBooks account
4. Done — payments are now active

### Step 9: Customize Your Site
1. Go to Admin > Settings > Branding
2. Add your business name, logo, colors
3. Add services and testimonials
4. Save — your public site updates instantly

## For Multiple Clients

To deploy this for a new business client:

1. Fork/clone this repo
2. Create a new Vercel project
3. Create a new Intuit Developer app (one per business)
4. Add that app's credentials to Vercel env vars
5. Set the redirect URI in Intuit
6. Deploy
7. Have the client create their admin account and customize

Each deployment is completely independent. No shared data, no shared payments.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres + Drizzle ORM
- **Styling**: Tailwind CSS
- **Auth**: JWT sessions (bcrypt + jose)
- **Payments**: QuickBooks Payments API
- **Accounting**: QuickBooks Online Accounting API
- **Icons**: Lucide React

## Security Notes
- Card/bank numbers are **never stored** — only tokens
- Every QB API call uses a unique `request-Id`
- Admin sessions use HTTP-only secure cookies
- OAuth tokens stored encrypted in database
- CSRF protection via same-site cookies

## File Structure
```
src/
├── app/
│   ├── page.tsx              # Public landing page
│   ├── checkout/page.tsx     # Public checkout
│   ├── login/page.tsx        # Admin login
│   ├── admin/
│   │   ├── page.tsx          # Dashboard
│   │   ├── customers/        # Customer list
│   │   ├── charge/           # Charge from dashboard
│   │   ├── payments/         # Transaction history
│   │   ├── invoices/         # Invoice list
│   │   └── settings/         # All site settings
│   └── api/
│       ├── auth/             # Login, logout, register
│       ├── quickbooks/       # OAuth, charge, disconnect
│       └── settings/         # Read/write settings
├── components/
│   ├── admin/AdminSidebar.tsx
│   └── checkout/CheckoutForm.tsx
└── lib/
    ├── auth.ts               # JWT + bcrypt helpers
    ├── db/
    │   ├── index.ts          # DB connection
    │   ├── schema.ts         # All tables
    │   └── settings.ts       # Settings helpers
    └── quickbooks/
        └── index.ts          # Full QB API wrapper
```
