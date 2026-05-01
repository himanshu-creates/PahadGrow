# 🏔️ PahadGrow — Cultivating Growth from the Hills

A full-stack marketplace platform empowering Uttarakhand farmers to sell produce, rent land, share knowledge, and connect with their community.

---

## 📁 Project Structure

```
PahadGrow/
├── pahadgrow-frontend/Project/   ← React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── api.ts                ← All backend API calls
│   │   ├── main.tsx
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── routes.ts
│   │   │   ├── components/       ← Reusable UI components
│   │   │   ├── pages/            ← Route pages
│   │   │   └── contexts/         ← React contexts (Language etc.)
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
└── pahadgrow-backend/            ← Node.js + Express backend
    ├── server.js                 ← Entry point (port 4000)
    ├── data_store.js             ← In-memory DB (swap with real DB later)
    ├── middleware_auth.js        ← JWT auth middleware
    ├── route_auth.js             ← /api/auth routes
    ├── route_products.js         ← /api/products routes
    ├── route_orders.js           ← /api/orders routes
    ├── route_users.js            ← /api/users routes
    ├── package.json
    └── .env.example
```

---

## 🚀 Quick Start

### Backend (Terminal 1)
```bash
cd pahadgrow-backend
cp .env.example .env        # Set your JWT_SECRET
npm install
node server.js
# → Server running on http://localhost:4000
```

### Frontend (Terminal 2)
```bash
cd pahadgrow-frontend/Project
cp .env.example .env        # Set VITE_API_URL if needed
npm install
npm run dev
# → App running on http://localhost:5173
```

---

## 🔑 Demo Accounts

| Role    | Email              | Password |
|---------|--------------------|----------|
| Buyer   | buyer@demo.com     | demo123  |
| Seller  | seller@demo.com    | demo123  |
| Admin   | admin@demo.com     | demo123  |

---

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS v4, React Router v7, Framer Motion, Recharts, Radix UI

**Backend:** Node.js, Express v5, JWT Auth, bcryptjs, UUID (in-memory store — swap with MongoDB/PostgreSQL for production)

---

## 📌 API Endpoints

| Method | Endpoint                        | Auth    | Description              |
|--------|---------------------------------|---------|--------------------------|
| POST   | /api/auth/login                 | No      | Login                    |
| POST   | /api/auth/register              | No      | Register                 |
| GET    | /api/auth/me                    | Bearer  | Get current user         |
| GET    | /api/products                   | No      | List products            |
| GET    | /api/products/:id               | No      | Product + reviews        |
| POST   | /api/products                   | Seller  | Create product           |
| PUT    | /api/products/:id               | Seller  | Update product           |
| POST   | /api/products/:id/reviews       | Bearer  | Add review               |
| GET    | /api/orders                     | Bearer  | Get orders               |
| POST   | /api/orders                     | Bearer  | Place order              |
| PUT    | /api/orders/:id/status          | Seller  | Update order status      |
| GET    | /api/users/profile              | Bearer  | Get profile              |
| PUT    | /api/users/profile              | Bearer  | Update profile           |
| GET/POST | /api/users/cart               | Bearer  | Cart management          |
| POST   | /api/users/wishlist/:productId  | Bearer  | Toggle wishlist          |
| GET    | /api/users/land                 | No      | Land listings            |
| GET/POST | /api/users/community          | Bearer  | Community posts          |
| GET    | /api/health                     | No      | Health check             |
