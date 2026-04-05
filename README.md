# FinFlow — Finance Dashboard

A clean, interactive finance dashboard built with React + Vite for tracking financial activity.

## Features

### Dashboard Overview
- Summary cards: Total Balance, Income, Expenses, Savings Rate
- Line chart: Income vs Expenses (6-month trend)
- Doughnut chart: Spending breakdown by category
- Monthly net balance bar chart

### Transactions
- Full transaction table with Date, Description, Category, Type, Amount
- Search by description or category
- Filter by type (income/expense) and category
- Sort by date or amount
- CSV export

### Role-Based UI (RBAC)
- **Viewer**: Read-only access — can view all data, filter, and export
- **Admin**: Can add, edit, and delete transactions via a modal form
- Switch roles via the navbar dropdown — no login required (simulated)

### Insights
- Highest and lowest spending category
- Best month by net savings
- Average monthly income & expenses
- Overall savings rate
- Category breakdown with visual progress bars
- Monthly comparison bar chart

### Additional Features
- Dark / Light mode toggle (persists via localStorage)
- Data persistence via localStorage (transactions survive refreshes)
- Fully responsive layout (mobile, tablet, desktop)
- Empty state handling when no results match filters
- Graceful handling of edge cases (no transactions, zero income, etc.)

## Tech Stack

- **React 18** with hooks
- **Vite** for fast dev/build
- **React Context + useReducer** for state management
- **Chart.js** for data visualizations
- **CSS custom properties** for theming (no CSS framework)
- **localStorage** for persistence

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation + role switcher + dark mode
│   ├── Dashboard.jsx       # Overview with summary cards + charts
│   ├── Transactions.jsx    # Transaction table with filters + RBAC
│   ├── TransactionModal.jsx# Add/edit modal (Admin only)
│   └── Insights.jsx        # Analytics + category breakdown
├── context/
│   └── AppContext.jsx      # Global state with useReducer
├── data/
│   └── transactions.js     # Mock data generator + categories
├── App.jsx
├── App.css
└── main.jsx
```

## State Management

Global state is managed using **React Context + useReducer** in `AppContext.jsx`:
- `transactions` — array of all transactions (persisted to localStorage)
- `role` — "viewer" | "admin" (persisted to localStorage)
- `darkMode` — boolean (persisted to localStorage)
- `filters` — `{ type, category, search, sortBy }`
- `activeTab` — current page

Derived state (filtered/sorted transactions, totals) is computed at the Context level and provided via context value.

## Assumptions

- All data is mock/static — no real backend or API
- Role switching is UI-only for demonstration
- Transactions span Oct 2025 – Mar 2026 (6 months)
- Currency is USD
