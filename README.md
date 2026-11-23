# SalonBook - Client

SalonBook is a salon appointment booking platform where customers can explore salon services, request appointments, manage their bookings, and view payment records. Administrators can manage services, appointments, users, and transactions through a role-based dashboard.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth
- MongoDB
- REST API

## Main Features

- Responsive salon-themed user interface
- Browse available salon services
- Search services by name
- Filter services by category
- Sort services by price
- View detailed service information
- Email and password authentication
- Google authentication
- Role-based customer and admin dashboards
- Customer appointment booking and management
- Admin service management
- Admin appointment management
- Admin user management
- Customer profile management
- Profile image upload using ImgBB
- Dashboard statistics
- Transaction history
- Demo payment workflow (simulated payment only; no real money is charged)
- Loading states, error handling, and toast notifications

**Payment Note:** The current payment workflow is a demo implementation. Real Stripe Checkout and verified webhook integration are not yet implemented.

## Environment Variables

Create a `.env.local` file in the client project root and configure the required variables:

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=
```

Never commit environment files or secret credentials to GitHub.

## Installation

Clone the repository:

```bash
git clone https://github.com/Mashrafe313/salonbook-client.git
```

Navigate to the project directory:

```bash
cd salonbook-client
```

Install dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a production build:

```bash
npm run build
```

## Live Website

To be added after deployment.

## Repositories

- **Client:** https://github.com/Mashrafe313/salonbook-client
- **Server:** https://github.com/Mashrafe313/salonbook-server
