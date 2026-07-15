# Event Booking System

A production-quality full-stack event booking platform built with Next.js 15, Prisma, SQLite, and JWT authentication (HttpOnly cookies).

## Features

### User
- Register, login, logout
- Browse, search, and filter events
- View event details and book seats
- Cancel bookings and view booking history
- Update profile (name, email, password)

### Admin
- Secure admin dashboard with metrics
- Create, edit, and delete events
- Manage event capacity
- View all bookings and users

## Tech Stack

- **Next.js 15** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Prisma ORM** + **SQLite**
- **JWT** (`jose`) in HttpOnly cookies
- **Zod** validation
- **bcryptjs** password hashing

## Getting Started

### Prerequisites

- Node.js 20.19+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run migrations and seed data
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed Accounts

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@example.com | Admin123!  |
| User  | user@example.com  | User123!   |

## Environment Variables

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-32-char-random-secret-here"
```

## Scripts

| Command           | Description                    |
|-------------------|--------------------------------|
| `npm run dev`     | Start dev server               |
| `npm run build`   | Production build               |
| `npm run start`   | Start production server        |
| `npm run lint`    | Run ESLint                     |
| `npm test`        | Run unit tests                 |
| `npm run db:seed` | Seed database                  |
| `npm run db:studio` | Open Prisma Studio           |

## Architecture

```
src/
├── app/           # App Router pages
├── actions/       # Server Actions (mutations)
├── components/    # Reusable UI components
├── lib/           # Auth, DB, validations, utilities
├── middleware.ts  # Route protection
└── types/         # Shared TypeScript types
```

### Security

- JWT stored in HttpOnly, SameSite=Lax cookies
- Middleware protects `/bookings`, `/profile`, `/admin/*`
- Server Actions re-verify session and role on every mutation
- Users can only cancel their own bookings
- Admin role is never accepted from client input

## Manual Test Checklist

- [ ] Register a new user and log in
- [ ] Browse events with search/filter
- [ ] Book an event and verify seat count decreases
- [ ] Cancel a booking and verify seat count increases
- [ ] Update profile name and password
- [ ] Log in as admin and access dashboard
- [ ] Create, edit, and delete an event
- [ ] Attempt `/admin` as a regular user (should redirect)
- [ ] Attempt to book when sold out (should fail)

## Deployment Notes

SQLite works well for local development and portfolio demos. For production deployment (e.g. Vercel), migrate to **PostgreSQL** since serverless environments use ephemeral filesystems.

## License

MIT
