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
