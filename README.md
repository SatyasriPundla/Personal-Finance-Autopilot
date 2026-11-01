# Personal Expense Tracker

A full-stack, production-grade personal finance dashboard built with React, Vite, Tailwind CSS, Chart.js, and Supabase. Tracks income, expenses, monthly category budgets, financial trends, and comprehensive analytics.

## Features

- **Authentication Module**: Secure sign-up, email/password login, password reset flow, protected routes, and session persistence via Supabase Auth.
- **Dashboard Overview**: 4 live metric stat cards (Total Balance, Total Income, Total Expenses, Remaining Monthly Budget with month-over-month comparisons), 3 interactive Chart.js visualizations (Income vs Expense bar chart, Category expense breakdown doughnut chart, and Monthly spending trend line chart), plus recent transactions.
- **Transaction Management**: Complete CRUD operations for income and expenses. Filter by transaction type, category, date range, search by title, and sort by date or amount.
- **Budget Management**: Category-level monthly spending limits. Real-time expense calculation against allocated limits, dynamic progress bars, and automated warnings when reaching 80% or exceeding 100% of budget.
- **Financial Analytics**: Deep dive into spending habits, savings rate, highest expenditure category, monthly averages, and custom date range filters.
- **Profile & Settings**: Profile name management, password change, currency selection (default: INR ₹ with Indian number formatting `₹1,00,000`, plus USD, EUR, GBP), and live Supabase connection status.
- **Responsive & Modern Design**: Clean SaaS interface, collapsible sidebar on desktop, mobile drawer, zero-pill typography, and accessible design.

## Tech Stack

- **Frontend**: React 19, Vite, React Router DOM v7
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Charts**: Chart.js v4, React-Chartjs-2
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase Authentication

## Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

You can also configure or update your Supabase URL and Anon Key directly through the interactive **Supabase Connection** modal inside the application without restarting the server!

## Database Setup in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. In the left navigation, click on **SQL Editor**.
3. Click **New Query**, paste the contents of `supabase_schema.sql`, and click **Run**.
4. Navigate to **Project Settings -> API** to copy your **Project URL** and **anon public key**.
5. Paste them into the application via the UI connection modal or `.env` file.

## Running Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```
