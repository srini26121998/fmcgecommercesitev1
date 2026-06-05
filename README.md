# FMCG Commerce — Premium Grocery E-commerce

A modern, high-performance grocery e-commerce platform built with Next.js 15, TypeScript, and Tailwind CSS. Featuring 10-minute delivery promises, dynamic analytics, and a robust admin dashboard.

## 🚀 Key Features

- **Blazing Fast Browsing:** Server-side rendering (SSR) and optimized image handling for instant page loads.
- **Smart Cart:** Persisted cart state with dynamic weight handling and coupon logic.
- **Advanced Checkout:** Multi-mode delivery (Express, Scheduled, Pickup, Subscription) with address management.
- **Admin Dashboard:** Real-time operations overview with live sales charts and inventory health tracking.
- **SEO Ready:** Complete metadata, OpenGraph tags, and automated sitemap generation.
- **Responsive Design:** Mobile-first approach ensuring a premium experience on all devices.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** Zustand (with Persistence)
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Build Tool:** Turbopack

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/your-username/FMCG-Ecommerce-Site-V1.git
cd FMCG-Ecommerce-Site-V1
npm install
```

### 3. Environment Setup
Copy the example environment file and fill in your production values:
```bash
cp .env.example .env.local
```

### 4. Development
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
npm run start
```

## 🌐 Deployment

This project is optimized for **Vercel**. Simply connect your repository to Vercel, import the environment variables, and deploy.

### Security Note
The project includes pre-configured security headers (CSP, HSTS, etc.) in `next.config.ts`. Ensure your deployment platform respects these settings.

## 🛡 Security & Reliability

- **Route Guards:** Admin pages are protected by an `AdminGuard` component.
- **Input Validation:** All critical forms (Checkout, Admin) include schema-based validation.
- **Error Handling:** Global error boundaries and specific settings fallbacks are implemented to prevent full-app crashes.

## 📄 License

This project is private. See [AGENTS.md](./AGENTS.md) for more details.
