
=======
# 🛒 Ecommerce Platform – Next.js 14

A **modern, high-performance eCommerce platform** built with **Next.js v14**, **React v18**, and **Tailwind CSS v3**, leveraging **PostgreSQL** and **Drizzle ORM** for robust and scalable data management.  

This platform supports:
- **Secure user authentication** with **JWT**
- **Role-based authorization** for admin product management
- **Full-text search** with filters powered by PostgreSQL
- **Seamless checkout** with Stripe integration

---

## 🚀 Tech Stack

**Frontend**
- **Next.js 14** – App Router, optimized routing, server actions
- **React 18** – Concurrent features & rendering optimizations
- **Tailwind CSS v3** – Utility-first responsive styling
- **TypeScript** – Full type safety
- **Jotai** – Minimal and fast state management
- **TanStack Query** – Efficient API fetching & caching
- **Formik** – Robust form handling & validation

**Backend**
- **PostgreSQL** – Scalable relational database
- **Drizzle ORM** – Type-safe SQL & migrations
- **JWT** – Authentication & role-based authorization
- **Stripe** – Payment processing

---

## 🗄 Database Setup

We use **Drizzle ORM** for database schema management.

### **Push Schema**
After adding your database URL to `.env`:

```bash
npx drizzle-kit push
```
<<<<<<< HEAD
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
