# PartyWings Admin Panel

Admin dashboard for managing the PartyWings platform.

## Tech Stack

- React 19 + TypeScript
- MUI 6 (Material UI)
- Vite 6
- Apollo Client 3
- Formik + Yup for forms
- React Router DOM 7

## Setup

```bash
# Install dependencies
pnpm install

# Copy env file
cp .env.example .env

# Start development server
pnpm dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | GraphQL API URL (default: http://localhost:4039/graphql) |

## Scripts

```bash
pnpm dev          # Start dev server (port 4040)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm type-check   # Type check without emitting
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
```

## Pages

- **Dashboard** — Stats overview (users, pods, revenue)
- **Users** — User management with pagination, search, role updates
- **Pods** — Pod management with filtering and sorting
- **Policies** — Create/edit platform policies (Terms, Privacy, Venue)

## Admin Credentials

Default admin credentials are sent via the "Send Credentials to Email" button on the login page (always sends to suryansh@exyconn.com).
