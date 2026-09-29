# EVENTIS Admin

Initial React / Next.js foundation for the EVENTIS admin portal.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`

## Project Structure

```txt
eventis-admin/
├── app/
│   ├── favicon.ico
│   ├── globals.css         # Tailwind v4 configuration and theme tokens
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Initial starter page
├── components/
│   └── ui/                 # Reusable UI primitives (button, input, card, badge, etc.)
├── hooks/                  # Custom React hooks (useDebounce, useMediaQuery, etc.)
├── lib/
│   └── utils.ts            # Utility functions (cn, formatters)
├── types/                  # Shared TypeScript definitions
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── package.json
└── tsconfig.json
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start local development server with Turbopack
- `npm run build` - Create an optimized production build
- `npm run start` - Start the production build locally
- `npm run lint` - Run ESLint checks
