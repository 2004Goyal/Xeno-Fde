# Xeno-Fde – Multi-Tenant Shopify Data Ingestion & Insights Service

This project simulates how Xeno Forward Deployed Engineers (FDEs) work with enterprise retailers to ingest, store, and analyze data from multiple Shopify stores. It ingests customers, products, and orders into a multi-tenant MySQL database and provides business insights through a dashboard.

---

## 🚀 Setup Instructions

### 1. Clone the Repository
   ```bash
   git clone https://github.com/your-username/Xeno-Fde.git
   cd Xeno-Fde
  ```
Install Dependencies

Backend:
bash
```
cd backend
npm install
```

Frontend (Next.js):
bash
```
cd frontend
npm install
```

Configure Environment Variables
Create .env files in both backend and frontend directories.

Backend .env
env
```
DATABASE_URL="mysql://username:password@host:port/dbname"
JWT_SECRET="your-secret-key"
```

Frontend .env
env
```
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Database Setup
bash
```
npx prisma migrate dev
npx prisma studio   # optional: view DB in browser
Run the Project
```
Start backend:
bash
```
npm run dev
```

Start frontend:
bash
```
npm run dev
Access dashboard at:
👉 http://localhost:3001/dashboard
```
Test Login Credentials
```
Email: you@example.com
Password: Strong@123
```
## 📊 Architecture Diagram
![Architecture Diagram](docs/architecture_diagram.png)

### 📡 API Endpoints

## Auth
```
POST /auth/register → Register a tenant
POST /auth/login → Login tenant, returns JWT
```
## Sync
```
POST /sync/customers → Sync customers
POST /sync/orders → Sync orders
POST /sync/products → Sync products
POST /sync/abandoned-checkouts → Sync abandoned checkouts
```
## Insights
```
GET /insights/summary → Total customers, orders, revenue, AOV
GET /insights/orders-by-date?from&to → Order trend
GET /insights/top-customers → Top 5 customers
GET /insights/top-products → Top 5 products
GET /insights/new-vs-repeat → New vs Repeat customers
```
## Health 
```
GET /health → Database connection check
```

### 🗄️ Database Schema
prisma
```
model Tenant {
  id         Int       @id @default(autoincrement())
  name       String
  email      String
  shopDomain String
  orders     Order[]
  customers  Customer[]
}

model Customer {
  id        Int      @id @default(autoincrement())
  tenantId  Int
  shopifyId String
  name      String
  email     String?
  orders    Order[]
}

model Product {
  id        Int      @id @default(autoincrement())
  tenantId  Int
  shopifyId String
  title     String
  price     Decimal @db.Decimal(10,2)
}

model Order {
  id         Int      @id @default(autoincrement())
  tenantId   Int
  shopifyId  String
  customerId Int?
  total      Decimal  @db.Decimal(10,2)
  orderDate  DateTime
  @@map("Order")
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  price     Decimal @db.Decimal(10,2)
}

model CheckoutEvent {
  id         Int     @id @default(autoincrement())
  checkoutId String
  status     String
  email      String?
  subtotal   Decimal @db.Decimal(10,2)
  tenantId   Int
}
```

### 🧪 Testing Payments (Shopify Bogus Gateway)
Shopify’s Bogus Gateway is enabled for testing.
Use these codes in place of a credit card number at checkout:
```
1 → Approved Transaction
2 → Declined Transaction
3 → Gateway Failure
```
## Card security code: any 3 digits
## Expiry date: any future date

## ⚠️ Known Limitations / Assumptions
Each Shopify dev store is treated as a separate tenant (tenantId).
Dummy data is sufficient for testing (not connected to live stores).
Abandoned checkout events may not always appear in dev stores.
Email/password login is used (OAuth 2.0 integration for Shopify apps not implemented yet).
Error handling, retries, and monitoring are minimal (can be added in production).

## 👤 Author
Dhruv Goyal
Roll No: 2210991506
