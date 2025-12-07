# SG Technologies POS System

A modern Point of Sale system reengineered from a legacy Java desktop application to a Next.js web application with MongoDB Atlas.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=flat&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=flat&logo=tailwind-css)

---

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Migration from Legacy System](#migration-from-legacy-system)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Functionality
- ✅ **Employee Management** - Add, update, delete employees (Admin only)
- ✅ **Authentication** - Role-based access (Admin/Cashier)
- ✅ **Sales Transactions** - Process sales with tax calculation (6%)
- ✅ **Rental Transactions** - 14-day rental period tracking
- ✅ **Return Processing** - Handle unsatisfactory items and rental returns
- ✅ **Late Fee Calculation** - Automatic 10% per day late fees
- ✅ **Coupon System** - 10% discount with valid coupons (C001-C200)
- ✅ **Inventory Management** - Real-time stock updates
- ✅ **Audit Logging** - Track employee login/logout events
- ✅ **Payment Methods** - Cash and credit card (16-digit validation)

### Technical Features
- 🌐 **Web-based** - Access from any browser
- 📱 **Responsive Design** - Works on desktop and tablets
- 🔄 **Real-time Updates** - React state management with SWR
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🔒 **Secure** - Environment-based configuration
- 📊 **Reporting** - Transaction history and analytics
- ☁️ **Cloud Database** - MongoDB Atlas with automatic backups

---

## 💻 System Requirements

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **MongoDB Atlas Account**: Free tier available
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### Recommended Hardware
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Internet**: Stable connection for MongoDB Atlas

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pos-system-engineeringnew2
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16
- React 18
- MongoDB driver
- Tailwind CSS
- shadcn/ui components
- And more...

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=pos_system

# Application Configuration (Optional)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Environment Variable Details

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB` | Database name | ✅ Yes | `pos_system` |
| `NEXT_PUBLIC_API_URL` | API base URL | ❌ No | `http://localhost:3000` |

### 3. Get MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<username>` and `<password>` with your credentials

---

## 🗄️ Database Setup

### Option 1: Migrate Legacy Data (Recommended)

If you have legacy data from the Java system:

```bash
# Run migration script
npx tsx scripts/migrate-legacy-data.ts
```

This will:
- ✅ Migrate all employees from `employeeDatabase.txt`
- ✅ Migrate all products from `itemDatabase.txt` and `rentalDatabase.txt`
- ✅ Migrate all customers from `userDatabase.txt`
- ✅ Migrate all coupons from `couponNumber.txt`
- ✅ Migrate audit logs from `employeeLogfile.txt`
- ✅ Create necessary indexes

**Expected Output:**
```
Connected to MongoDB Atlas
Migrating employees...
✓ Migrated 12 employees
Migrating products...
✓ Migrated 125 products (101 sale + 24 rental)
Migrating customers...
✓ Migrated 13 customers
Migrating coupons...
✓ Migrated 200 coupons
Migrating audit logs...
✓ Migrated 45 audit log entries
Migration completed successfully!
```

### Option 2: Start Fresh

The application will automatically create collections on first use. You'll need to manually create an admin user:

1. Start the application
2. Use MongoDB Compass or Atlas UI
3. Insert a user document:

```json
{
  "userId": "USR-001",
  "username": "admin",
  "password": "admin123",
  "role": "admin",
  "firstName": "Admin",
  "lastName": "User",
  "name": "Admin User",
  "email": "admin@sgtech.com",
  "isActive": true,
  "createdAt": { "$date": "2024-12-07T00:00:00.000Z" }
}
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at **http://localhost:3000**

**Features in Development Mode:**
- 🔥 Hot reload (instant updates on code changes)
- 🐛 Detailed error messages
- 📊 React DevTools support

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Default Login Credentials

After migration, use these credentials:

| Username | Password | Role |
|----------|----------|------|
| `harrylarry` | `1` | Admin |
| `debracooper` | `lehigh2016` | Cashier |

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
# Deploy to production
vercel --prod
```

#### 4. Set Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB`: `pos_system`

#### 5. Redeploy

```bash
vercel --prod
```

### Deploy to Other Platforms

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t pos-system .
docker run -p 3000:3000 --env-file .env.local pos-system
```

---

## 🔄 Migration from Legacy System

### Prerequisites

Ensure you have the legacy database files in the `Database/` directory:
- `employeeDatabase.txt`
- `itemDatabase.txt`
- `rentalDatabase.txt`
- `userDatabase.txt`
- `couponNumber.txt`
- `employeeLogfile.txt`

### Migration Steps

1. **Backup Legacy Data**
   ```bash
   cp -r Database/ Database_backup/
   ```

2. **Configure MongoDB**
   - Set up `.env.local` with MongoDB URI

3. **Run Migration**
   ```bash
   npx tsx scripts/migrate-legacy-data.ts
   ```

4. **Verify Migration**
   - Check MongoDB Atlas dashboard
   - Verify record counts match
   - Test login with legacy credentials

### Migration Mapping

| Legacy File | New Collection | Records |
|-------------|---------------|---------|
| `employeeDatabase.txt` | `users` | 12 |
| `itemDatabase.txt` | `products` (sale) | 101 |
| `rentalDatabase.txt` | `products` (rental) | 24 |
| `userDatabase.txt` | `customers` | 13 |
| `couponNumber.txt` | `coupons` | 200 |
| `employeeLogfile.txt` | `audit_logs` | Variable |

---

## 📁 Project Structure

```
pos-system-engineeringnew2/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── employees/            # Employee CRUD
│   │   ├── products/             # Product CRUD
│   │   ├── transactions/         # Transaction processing
│   │   ├── customers/            # Customer management
│   │   └── audit-logs/           # Audit log retrieval
│   ├── login/                    # Login page
│   ├── admin/                    # Admin dashboard
│   ├── cashier/                  # Cashier dashboard
│   └── transaction/              # Transaction page
│
├── lib/                          # Business logic & utilities
│   ├── db/                       # Database connection
│   │   └── mongodb.ts            # MongoDB singleton
│   ├── repositories/             # Data access layer
│   │   ├── base-repository.ts
│   │   ├── user-repository.ts
│   │   ├── product-repository.ts
│   │   ├── transaction-repository.ts
│   │   └── customer-repository.ts
│   ├── services/                 # Business logic layer
│   │   ├── auth-service.ts
│   │   ├── employee-service.ts
│   │   ├── transaction-service.ts
│   │   └── customer-service.ts
│   └── types/                    # TypeScript definitions
│       └── models.ts
│
├── components/                   # React components
│   └── ui/                       # shadcn/ui components
│
├── scripts/                      # Utility scripts
│   └── migrate-legacy-data.ts    # Legacy data migration
│
├── public/                       # Static assets
│
├── Database/                     # Legacy database files
│
├── .env.local                    # Environment variables (create this)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
└── tailwind.config.ts            # Tailwind config
```

---

## 📚 API Documentation

### Authentication

#### POST `/api/auth/login`
```json
// Request
{
  "username": "harrylarry",
  "password": "1"
}

// Response
{
  "success": true,
  "data": {
    "user": { "userId": "USR-001", "role": "admin", ... },
    "roleCode": 2
  }
}
```

#### POST `/api/auth/logout`
```json
// Request
{
  "userId": "USR-001",
  "position": "admin"
}

// Response
{
  "success": true
}
```

### Transactions

#### POST `/api/transactions`
```json
// Request (Sale)
{
  "type": "sale",
  "items": [
    {
      "product": { "productId": "PRD-S1000", "name": "Potato", "price": 1.0 },
      "quantity": 5,
      "subtotal": 5.0
    }
  ],
  "paymentMethod": "cash",
  "cashierId": "USR-001",
  "couponCode": "C001"
}

// Response
{
  "success": true,
  "data": {
    "transactionId": "TXN-1234567890",
    "total": 4.77,
    "tax": 0.27,
    "discount": 0.5
  }
}
```

### Customers

#### GET `/api/customers/[phone]/rentals`
```json
// Response
{
  "success": true,
  "data": [
    {
      "productId": "PRD-R1010",
      "productName": "ParksAndRecSeason3",
      "daysLate": 3294,
      "lateFeePerDay": 2.0
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error:** `MongoServerError: bad auth`

**Solution:**
- Verify `MONGODB_URI` in `.env.local`
- Check username and password
- Ensure IP address is whitelisted in MongoDB Atlas

#### 2. Migration Script Fails

**Error:** `Cannot find module 'tsx'`

**Solution:**
```bash
npm install -D tsx
```

#### 3. Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### 4. Build Errors

**Error:** `Type error: Cannot find module...`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### 5. Environment Variables Not Loading

**Solution:**
- Ensure `.env.local` is in root directory
- Restart development server after changes
- For production, set variables in hosting platform

### Getting Help

- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 🗄️ [MongoDB Documentation](https://docs.mongodb.com/)
- 💬 [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 🔐 Security Considerations

### Production Checklist

- [ ] Change default passwords
- [ ] Implement password hashing (currently plain text)
- [ ] Add JWT authentication
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Implement input validation
- [ ] Enable MongoDB encryption at rest
- [ ] Set up monitoring and logging
- [ ] Regular security audits

### Recommended Improvements

1. **Password Hashing**
   ```bash
   npm install bcrypt
   ```

2. **JWT Authentication**
   ```bash
   npm install jsonwebtoken
   ```

3. **Environment Validation**
   ```bash
   npm install zod
   ```

---

## 📊 Performance Optimization

### Production Optimizations

1. **Enable Caching**
   - SWR for client-side caching
   - MongoDB query result caching

2. **Database Indexing**
   - Already indexed: `userId`, `username`, `phone`, `productId`
   - Add custom indexes as needed

3. **Image Optimization**
   - Use Next.js Image component
   - Enable WebP format

4. **Code Splitting**
   - Automatic with Next.js
   - Use dynamic imports for large components

---

## 📝 License

This project is part of CSE216 - Software Engineering coursework.

---

## 👥 Credits

**Original System**: Java Desktop Application (December 2015)  
**Reengineered System**: Next.js Web Application (December 2024)  
**Course**: CSE216 - Software Engineering

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [API Documentation](#api-documentation)
3. Contact system administrator

---

**Version**: 1.0  
**Last Updated**: December 7, 2024
