# SmartCashFlow Frontend

React web client for a personal-finance app: multiple wallets, income/expense tracking, and rule-based auto-allocation of income. It talks to the REST API in [smartcashflow-backend](https://github.com/ArifRitzky/smartcashflow-backend) (Spring Boot + PostgreSQL).

**Status: work in progress / demo.** See [Known limitations](#known-limitations).

## Features

- **Dashboard**: total balance, income and expense totals, cash-flow line chart, balance distribution per wallet, recent transactions, unresolved allocation deficits.
- **Wallets**: create wallets with an opening balance and currency, deactivate wallets.
- **Transactions**: add income/expense per wallet, filter by type.
- **Allocation rules**: define rules by percentage or fixed amount per budget category, with a running total of the percentages.
- **Settings**: theme color and sidebar background, stored in the browser only.

## Tech stack

React 19, Vite, React Router, Axios, Recharts, Tailwind CSS.

## Run locally

Requires Node.js 20+ and the backend running on port 8080 (see the backend README).

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

`VITE_API_URL` sets the backend base URL (default `http://localhost:8080/api`). The backend must allow the frontend origin in its CORS configuration.

Other scripts: `npm run build`, `npm run lint`.

## Known limitations

- **No real authentication.** "Login" looks a user up by email (and creates one if missing). There is no password or token, so anyone who knows an email can open that account. Do not enter real financial data.
- The logged-in user is kept in `localStorage`, so it is per browser and not protected.
- No automated frontend tests yet.
- Receipt OCR and notification features are not implemented.
- Error handling is basic: backend validation messages are shown on forms, but not everywhere.
