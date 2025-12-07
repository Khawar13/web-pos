# POS System Reengineering Documentation

## Project Information
- **Project Name:** SG Technologies POS System Reengineering
- **Original System:** Java Swing Desktop Application (Dec 2015)
- **Reengineered System:** Next.js 15 Web Application
- **Team Members:** Ali, Khawar, Saima
- **Date:** December 2024

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Legacy System Analysis](#2-legacy-system-analysis)
3. [Functionality Checklist](#3-functionality-checklist)
4. [Architecture Comparison](#4-architecture-comparison)
5. [Technology Stack](#5-technology-stack)
6. [Database Schema & Migration](#6-database-schema--migration)
7. [Component Mapping](#7-component-mapping)
8. [Refactoring Documentation](#8-refactoring-documentation)
9. [Reengineering Plan & Timeline](#9-reengineering-plan--timeline)
10. [Design Patterns](#10-design-patterns)
11. [Improved Architecture Justification](#11-improved-architecture-justification)
12. [Comprehensive Refactoring Summary](#12-comprehensive-refactoring-summary)
13. [Normalized Schema & Data Migration Rationale](#13-normalized-schema--data-migration-rationale)
14. [Setup Instructions](#14-setup-instructions)

---

## 1. Executive Summary

This document details the reengineering of a legacy Java Swing Point of Sale (POS) system into a modern web-based application. The original system was developed in 2015 using Java with text file-based storage. The reengineered system uses Next.js 15, TypeScript, and MongoDB Atlas.

### Key Improvements
- **Architecture:** Monolithic -> Layered (Presentation, Business Logic, Data Access)
- **Storage:** Text files -> MongoDB Atlas with normalized schema
- **UI:** Java Swing -> Modern React-based web interface
- **Accessibility:** Desktop-only -> Cross-platform web access
- **Maintainability:** Tightly coupled -> Modular, testable components

---

## 2. Legacy System Analysis

### 2.1 Original System Overview

\`\`\`
Original System: SG Technologies POS System
Version: Alpha Release (Dec 9, 2015)
Language: Java
UI Framework: Swing
Database: Text Files (.txt)
Design Patterns: Singleton, Abstract Factory
\`\`\`

### 2.2 Legacy Source Code Files

| File | Description |
|------|-------------|
| `Employee.java` | Gets employee's username, name, position, and password; validates credentials |
| `EmployeeManagement.java` | Handles authorization; allows add/update/delete of employee database |
| `HandleReturns.java` | Gets user info (creates if not exists); removes items from rental database |
| `Inventory.java` | Singleton pattern; accesses inventory database and makes updates |
| `Item.java` | Contains getter methods for items in the database |
| `Management.java` | Uses phone number to check customer; manages rental info and due dates |
| `POR.java` | Point of Rental - extends PointOfSale for rental transactions |
| `POS.java` | Point of Sale - extends PointOfSale for sale transactions |
| `POH.java` | Point of Handle Returns - extends PointOfSale for returns |
| `PointOfSale.java` | Abstract class for adding/removing items, calculating totals with tax, applying coupons |
| `POSSystem.java` | Main interface with welcome/login; routes to cashier or admin menu |
| `Rental.java` | Finds user in DB or creates account; manages rental items |
| `ReturnItem.java` | Finds itemID in DB and marks return date |
| `Sale.java` | Handles sale transactions |
| `Login_Interface.java` | GUI for login |
| `Cashier_Interface.java` | GUI for cashier menu (Sale/Rental/Return options) |
| `Admin_Interface.java` | GUI for admin (employee management) |
| `Transaction_Interface.java` | GUI for transaction entry (add/remove items) |
| `Payment_Interface.java` | GUI for payment processing |

### 2.3 Legacy Data Flow

\`\`\`mermaid
flowchart TD
    A[User Input - Swing GUI] --> B[POSSystem Interface]
    B --> C{User Role}
    C -->|Admin| D[EmployeeManagement]
    C -->|Cashier| E[Transaction Selection]
    E --> F{Transaction Type}
    F -->|Sale| G[POS Class]
    F -->|Rental| H[POR Class]
    F -->|Return| I[POH Class]
    G --> J[Inventory Singleton]
    H --> J
    I --> J
    H --> K[Management Class]
    I --> K
    J --> L[(Text Files)]
    K --> L
    D --> M[(employeeDatabase.txt)]
\`\`\`

---

## 3. Functionality Checklist

### Complete Feature Mapping: Legacy Java -> Web Application

| # | Legacy Feature | Legacy Class(es) | Web Implementation | Status |
|---|----------------|------------------|-------------------|--------|
| **Authentication & Authorization** |
| 1 | Employee Login | `POSSystem.login()`, `Login_Interface.java` | `app/login/page.tsx`, `lib/services/auth-service.ts` | ✅ Complete |
| 2 | Employee Logout | `POSSystem.java` | `app/api/auth/logout/route.ts` | ✅ Complete |
| 3 | Role-based Routing (Admin/Cashier) | `POSSystem.java` | `app/login/page.tsx` (redirects based on role) | ✅ Complete |
| 4 | Login/Logout Audit Logging | `employeeLogfile.txt` writes | `lib/services/auth-service.ts` -> `audit_logs` collection | ✅ Complete |
| **Employee Management (Admin)** |
| 5 | Add Cashier | `EmployeeManagement.addEmployee()` | `app/admin/page.tsx`, `app/api/employees/route.ts` | ✅ Complete |
| 6 | Add Admin | `EmployeeManagement.addEmployee()` | `app/admin/page.tsx`, `app/api/employees/route.ts` | ✅ Complete |
| 7 | Update Employee Info | `EmployeeManagement.updateEmployee()` | `app/admin/page.tsx`, `app/api/employees/[id]/route.ts` | ✅ Complete |
| 8 | Delete Employee | `EmployeeManagement.removeEmployee()` | `app/admin/page.tsx`, `app/api/employees/[id]/route.ts` | ✅ Complete |
| 9 | View Employee List | `Admin_Interface.java` | `app/admin/page.tsx` | ✅ Complete |
| **Sale Transactions** |
| 10 | Start Sale Transaction | `Sale.java`, `POS.java` | `app/cashier/page.tsx` -> `app/transaction/page.tsx?type=sale` | ✅ Complete |
| 11 | Add Item by ID | `PointOfSale.addItem()` | `app/transaction/page.tsx` (handleAddItem) | ✅ Complete |
| 12 | Remove Item | `PointOfSale.removeItem()` | `app/transaction/page.tsx` (handleRemoveItem) | ✅ Complete |
| 13 | Calculate Subtotal | `PointOfSale.calculateTotal()` | `app/transaction/page.tsx` (derived state) | ✅ Complete |
| 14 | Apply 6% Tax | `PointOfSale.java` | `lib/services/transaction-service.ts` (TAX_RATE = 0.06) | ✅ Complete |
| 15 | Apply Coupon (10% discount) | `PointOfSale.coupon()` | `app/transaction/page.tsx`, validated via `coupons` collection | ✅ Complete |
| 16 | Cash Payment | `Payment_Interface.java` | `app/transaction/page.tsx` (payment dialog) | ✅ Complete |
| 17 | Credit Card Payment | `PointOfSale.creditCard()` | `app/transaction/page.tsx` (16-digit validation) | ✅ Complete |
| 18 | Calculate Change | `Payment_Interface.java` | `app/transaction/page.tsx` | ✅ Complete |
| 19 | Update Inventory on Sale | `Inventory.updateQuantity()` | `lib/services/product-service.ts` (updateStock) | ✅ Complete |
| 20 | Record Transaction | `saleinvoiceRecord.txt` | `transactions` collection in MongoDB | ✅ Complete |
| **Rental Transactions** |
| 21 | Start Rental Transaction | `Rental.java`, `POR.java` | `app/cashier/page.tsx` -> `app/transaction/page.tsx?type=rental` | ✅ Complete |
| 22 | Customer Phone Lookup | `Management.checkUser()` | `app/transaction/page.tsx` (handlePhoneSubmit) | ✅ Complete |
| 23 | Create Customer if Not Exists | `Management.java` | `app/api/customers/route.ts` | ✅ Complete |
| 24 | Add Rental Item | `POR.addItem()` | `app/transaction/page.tsx` (filters isRentable=true) | ✅ Complete |
| 25 | Set 14-Day Rental Period | `Management.addRental()` | `lib/services/transaction-service.ts` (RENTAL_DAYS = 14) | ✅ Complete |
| 26 | Record Customer Rental | `userDatabase.txt` | `customers.rentals[]` in MongoDB | ✅ Complete |
| 27 | Update Rental Inventory | `Inventory.java` | `lib/services/product-service.ts` | ✅ Complete |
| **Return Transactions** |
| 28 | Start Return Transaction | `HandleReturns.java`, `POH.java` | `app/cashier/page.tsx` -> `app/transaction/page.tsx?type=return` | ✅ Complete |
| 29 | Rental Return (with late fees) | `POH.java`, `ReturnItem.java` | `app/transaction/page.tsx` (returnType="rental") | ✅ Complete |
| 30 | Unsatisfactory Return (refund) | `POH.java` | `app/transaction/page.tsx` (returnType="unsatisfactory") | ✅ Complete |
| 31 | Check Outstanding Rentals | `Management.getOutstandingRentals()` | `app/api/customers/[phone]/rentals/route.ts` | ✅ Complete |
| 32 | Calculate Late Fees | `ReturnItem.java` | `lib/services/transaction-service.ts` (LATE_FEE_RATE = 0.1) | ✅ Complete |
| 33 | Mark Rental as Returned | `ReturnItem.markReturn()` | `lib/repositories/customer-repository.ts` (markRentalReturned) | ✅ Complete |
| 34 | Return Items to Inventory | `Inventory.updateQuantity()` | `lib/services/product-service.ts` (updateStock with +quantity) | ✅ Complete |
| **Inventory Management** |
| 35 | Get Item by ID | `Inventory.getItem()` | `lib/repositories/product-repository.ts` (findByLegacyId) | ✅ Complete |
| 36 | Filter Sale Items | `itemDatabase.txt` | Products with `isRentable=false` | ✅ Complete |
| 37 | Filter Rental Items | `rentalDatabase.txt` | Products with `isRentable=true` | ✅ Complete |
| **Coupon System** |
| 38 | Validate Coupon Code | `PointOfSale.coupon()` | `lib/repositories/coupon-repository.ts` | ✅ Complete |
| 39 | Apply 10% Discount | `PointOfSale.java` | `lib/services/transaction-service.ts` (DISCOUNT_RATE = 0.1) | ✅ Complete |
| 40 | Valid Codes: C001-C200 | `couponNumber.txt` | `coupons` collection (migrated 200 codes) | ✅ Complete |

### Testing Instructions for Each Feature

**Sale Transaction Test:**
1. Login: `debracooper` / `lehigh2016`
2. Click "Sale" on cashier menu
3. Enter item ID: `1000` (Potato - $1.00) -> Click Add
4. Enter item ID: `1002` (SkirtSteak - $15.00) -> Click Add
5. Click "End" to proceed to checkout
6. Enter coupon: `C001` -> Apply (10% off)
7. Select "Cash", enter $20.00
8. Complete - verify change calculation

**Rental Transaction Test:**
1. Login as cashier
2. Click "Rental"
3. Enter phone: `1234567892` (existing customer)
4. Enter item ID: `1000` (TheoryOfEverything - $30/day rental)
5. Complete checkout
6. Verify rental added to customer record

**Return Transaction Test (Rental):**
1. Login as cashier
2. Click "Returns"
3. Select "Rented Items"
4. Enter phone: `1111112222` (has outstanding rental)
5. System shows outstanding rentals with late fees
6. Add return item and process

**Admin Test:**
1. Login: `harrylarry` / `1`
2. View employee list
3. Click "Add Cashier" -> Enter name and password
4. Click "Update Employee" -> Change position or password
5. Delete an employee

---

## 4. Architecture Comparison

### 4.1 Legacy Architecture

\`\`\`mermaid
flowchart TB
    subgraph Legacy["Legacy System - Monolithic"]
        UI[Swing UI Layer]
        BL[Business Logic - Mixed in UI]
        DA[File I/O - Direct Access]
        DB[(Text Files)]
        
        UI --> BL
        BL --> DA
        DA --> DB
    end
\`\`\`

### 4.2 Reengineered Architecture

\`\`\`mermaid
flowchart TB
    subgraph New["Reengineered System - Layered Architecture"]
        subgraph Presentation["Presentation Layer"]
            Pages[Next.js Pages]
            Components[React Components]
            Hooks[Custom Hooks]
        end
        
        subgraph Business["Business Logic Layer"]
            Services[Service Classes]
            Validation[Validation Logic]
            Events[Event System]
        end
        
        subgraph Data["Data Access Layer"]
            Repos[Repository Classes]
            Models[TypeScript Models]
            DB[(MongoDB Atlas)]
        end
        
        Pages --> Components
        Components --> Hooks
        Hooks --> Services
        Services --> Repos
        Repos --> Models
        Models --> DB
    end
\`\`\`

### 4.3 Detailed System Architecture

\`\`\`mermaid
flowchart TD
    subgraph Client["Client Browser"]
        UI[React UI Components]
        State[SWR State Management]
        Auth[Auth Context]
    end
    
    subgraph Server["Next.js Server"]
        API[API Routes]
        MW[Middleware]
        
        subgraph Services["Service Layer"]
            AuthSvc[AuthService]
            TxnSvc[TransactionService]
            ProdSvc[ProductService]
            EmpSvc[EmployeeService]
            CustSvc[CustomerService]
        end
        
        subgraph Repos["Repository Layer"]
            UserRepo[UserRepository]
            ProdRepo[ProductRepository]
            TxnRepo[TransactionRepository]
            CustRepo[CustomerRepository]
        end
    end
    
    subgraph Database["MongoDB Atlas"]
        Users[(users)]
        Products[(products)]
        Transactions[(transactions)]
        Customers[(customers)]
        Coupons[(coupons)]
        AuditLogs[(audit_logs)]
    end
    
    UI --> State
    State --> API
    API --> MW
    MW --> Services
    Services --> Repos
    Repos --> Database
\`\`\`

---

## 5. Technology Stack

### 5.1 Technology Selection & Justification

| Layer | Legacy | Reengineered | Justification |
|-------|--------|--------------|---------------|
| **Language** | Java | TypeScript | Type safety, modern tooling, full-stack capability |
| **UI Framework** | Swing | React/Next.js 15 | Component-based, reactive updates, SEO support |
| **Styling** | Java AWT | Tailwind CSS | Utility-first, responsive, maintainable |
| **Database** | Text Files | MongoDB Atlas | Scalable, cloud-hosted, flexible schema |
| **State Management** | Local Variables | SWR | Caching, revalidation, optimistic updates |
| **API** | N/A | REST API Routes | Standard HTTP, easy testing, documentation |
| **Authentication** | File-based | JWT + Cookies | Secure, stateless, industry standard |

---

## 6. Database Schema & Migration

### 6.1 Normalized Database Schema

\`\`\`mermaid
erDiagram
    USERS {
        string userId PK
        string legacyId
        string username UK
        string password
        string role
        string firstName
        string lastName
        string email
        boolean isActive
        datetime createdAt
    }
    
    PRODUCTS {
        string productId PK
        string legacyId
        string name
        string description
        number price
        number cost
        number quantity
        string category
        string barcode
        boolean isRentable
        number rentalPricePerDay
        datetime createdAt
    }
    
    CUSTOMERS {
        string customerId PK
        string phone UK
        string name
        string email
        array rentalHistory
        boolean hasOutstandingRentals
        datetime createdAt
    }
    
    TRANSACTIONS {
        string transactionId PK
        string type
        array items
        number subtotal
        number tax
        number discount
        number total
        string paymentMethod
        string paymentStatus
        string cashierId FK
        string customerId FK
        datetime createdAt
    }
    
    COUPONS {
        string code PK
        number discountPercent
        boolean isActive
        number usedCount
        datetime createdAt
    }
    
    AUDIT_LOGS {
        string logId PK
        string userId FK
        string action
        string details
        datetime timestamp
    }
    
    USERS ||--o{ TRANSACTIONS : processes
    CUSTOMERS ||--o{ TRANSACTIONS : makes
    TRANSACTIONS ||--o{ PRODUCTS : contains
\`\`\`

### 6.2 Data Migration Plan

\`\`\`mermaid
flowchart LR
    subgraph Source["Legacy Text Files"]
        E1[employeeDatabase.txt]
        E2[itemDatabase.txt]
        E3[rentalDatabase.txt]
        E4[userDatabase.txt]
        E5[couponNumber.txt]
        E6[saleinvoiceRecord.txt]
        E7[employeeLogfile.txt]
    end
    
    subgraph Transform["Migration Script"]
        P1[Parse Text Files]
        P2[Normalize Data]
        P3[Generate IDs]
        P4[Create Relations]
    end
    
    subgraph Target["MongoDB Collections"]
        T1[(users)]
        T2[(products)]
        T3[(customers)]
        T4[(transactions)]
        T5[(coupons)]
        T6[(audit_logs)]
    end
    
    E1 --> P1
    E2 --> P1
    E3 --> P1
    E4 --> P1
    E5 --> P1
    E6 --> P1
    E7 --> P1
    
    P1 --> P2
    P2 --> P3
    P3 --> P4
    
    P4 --> T1
    P4 --> T2
    P4 --> T3
    P4 --> T4
    P4 --> T5
    P4 --> T6
\`\`\`

### 6.3 Legacy Database Files Migrated

| File | Records | Target Collection | Notes |
|------|---------|-------------------|-------|
| employeeDatabase.txt | 12 | users | Added userId, username derived from name |
| itemDatabase.txt | 101 | products | PRD-S prefix, isRentable=false |
| rentalDatabase.txt | 24 | products | PRD-R prefix, isRentable=true |
| userDatabase.txt | 13 | customers | Rental history normalized |
| couponNumber.txt | 200 | coupons | C001-C200, 10% discount each |
| saleinvoiceRecord.txt | 14 | transactions | Historical sale records |
| employeeLogfile.txt | 50 | audit_logs | Login/logout events |
| ReturnSale.txt | 4 | transactions | Return transaction records |

---

## 7. Component Mapping

### 7.1 Legacy to New System Mapping

| Legacy Component | New Component | Location |
|------------------|---------------|----------|
| `POSSystem.java` | `app/page.tsx`, `app/login/page.tsx` | Entry points |
| `Login_Interface.java` | `app/login/page.tsx` | Authentication |
| `Cashier_Interface.java` | `app/cashier/page.tsx` | Cashier menu |
| `Admin_Interface.java` | `app/admin/page.tsx` | Admin dashboard |
| `Transaction_Interface.java` | `app/transaction/page.tsx` | Transaction flow |
| `POS.java` | `lib/services/transaction-service.ts` | Sale processing |
| `POR.java` | `lib/services/transaction-service.ts` | Rental processing |
| `POH.java` | `lib/services/transaction-service.ts` | Return processing |
| `Inventory.java` | `lib/repositories/product-repository.ts` | Product data access |
| `Employee.java` | `lib/types/models.ts` (User type) | User model |
| `EmployeeManagement.java` | `lib/services/employee-service.ts` | Employee operations |
| `Item.java` | `lib/types/models.ts` (Product type) | Product model |
| `Management.java` | `lib/services/customer-service.ts` | Customer management |

---

## 8. Refactoring Documentation

### 8.1 Ali's Refactorings

#### Refactoring 1: Extract Singleton Pattern to Repository Pattern

**Before (Java - Inventory.java):**
\`\`\`java
public class Inventory {
    private static Inventory instance = null;
    
    private Inventory() {}
    
    public static Inventory getInstance() {
        if (instance == null) {
            instance = new Inventory();
        }
        return instance;
    }
    
    public Item getItem(String itemId) {
        try {
            BufferedReader reader = new BufferedReader(
                new FileReader("itemDatabase.txt"));
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(" ");
                if (parts[0].equals(itemId)) {
                    return new Item(parts[0], parts[1], 
                        Double.parseDouble(parts[2]),
                        Integer.parseInt(parts[3]));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
\`\`\`

**After (TypeScript - product-repository.ts):**
\`\`\`typescript
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super('products');
  }

  async findByLegacyId(legacyId: string): Promise<Product | null> {
    const db = await getDatabase();
    return db.collection<Product>(this.collectionName)
      .findOne({ legacyId });
  }

  async findRentableProducts(): Promise<Product[]> {
    const db = await getDatabase();
    return db.collection<Product>(this.collectionName)
      .find({ isRentable: true, isActive: true })
      .toArray();
  }

  async updateQuantity(productId: string, delta: number): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection<Product>(this.collectionName)
      .updateOne(
        { productId },
        { $inc: { quantity: delta }, $set: { updatedAt: new Date() } }
      );
    return result.modifiedCount > 0;
  }
}
\`\`\`

**Where we did this:** `lib/repositories/product-repository.ts`

**Explanation:** Replaced Singleton pattern with Repository pattern for better testability and separation of concerns. The repository handles all data access through MongoDB instead of direct file I/O.

**Quality Impact:**
- Testability: Can mock repository in tests
- Maintainability: Single responsibility for data access
- Scalability: MongoDB handles concurrent access

---

#### Refactoring 2: Replace Inheritance with Composition in Transaction Types

**Before (Java - POS.java, POR.java, POH.java):**
\`\`\`java
public abstract class PointOfSale {
    protected ArrayList<Item> items;
    protected double total;
    
    public abstract void processTransaction();
    
    public void addItem(Item item) {
        items.add(item);
        recalculateTotal();
    }
}

public class POS extends PointOfSale {
    @Override
    public void processTransaction() {
        // Sale-specific logic mixed with UI code
        updateInventory();
        writeToInvoiceFile();
        showReceiptDialog();
    }
}
\`\`\`

**After (TypeScript - transaction-service.ts):**
\`\`\`typescript
export class TransactionService {
  private readonly TAX_RATE = 0.06;
  private readonly DISCOUNT_RATE = 0.1;

  async processSale(items: CartItem[], paymentMethod: PaymentMethod, 
    cashierId: string, couponCode?: string): Promise<Transaction> {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = couponCode ? subtotal * this.DISCOUNT_RATE : 0;
    const tax = (subtotal - discount) * this.TAX_RATE;
    const total = subtotal - discount + tax;
    
    const transaction = await transactionRepository.create({...});
    
    for (const item of items) {
      await productService.updateStock(item.product.productId, -item.quantity);
    }
    
    return transaction;
  }

  async processRental(...) { /* Similar pattern */ }
  async processReturn(...) { /* Similar pattern */ }
}
\`\`\`

**Where we did this:** `lib/services/transaction-service.ts`

**Explanation:** Replaced abstract class inheritance with a single service class that handles all transaction types through composition.

**Quality Impact:**
- Reduced code duplication
- Easier to add new transaction types
- Clear separation between business logic and UI

---

#### Refactoring 3: Extract Configuration Constants

**Before (Java - scattered across files):**
\`\`\`java
// In POS.java
double tax = total * 0.06;

// In POR.java  
double tax = total * 0.06;

// In another file
if (coupon.startsWith("C") && coupon.length() == 4) {
    discount = 0.10;
}
\`\`\`

**After (TypeScript - transaction-service.ts):**
\`\`\`typescript
export class TransactionService {
  private readonly TAX_RATE = 0.06;        // 6% tax from original
  private readonly DISCOUNT_RATE = 0.1;    // 10% coupon discount
  private readonly LATE_FEE_RATE = 0.1;    // 10% per day late fee
  private readonly RENTAL_DAYS = 14;       // 14 days rental period
}
\`\`\`

**Where we did this:** `lib/services/transaction-service.ts`

**Quality Impact:** Single source of truth for configuration, easy to modify business rules.

---

### 8.2 Khawar's Refactorings

#### Refactoring 1: Replace Procedural File I/O with Async Repository Methods

**Before (Java - EmployeeManagement.java):**
\`\`\`java
public void addEmployee(String id, String pos, String fn, String ln, String pw) {
    try {
        FileWriter fw = new FileWriter("employeeDatabase.txt", true);
        BufferedWriter bw = new BufferedWriter(fw);
        PrintWriter out = new PrintWriter(bw);
        out.println(id + " " + pos + " " + fn + " " + ln + " " + pw);
        out.close();
    } catch (IOException e) {
        System.out.println("Error writing to file");
    }
}
\`\`\`

**After (TypeScript - user-repository.ts):**
\`\`\`typescript
export class UserRepository extends BaseRepository<User> {
  async create(userData: Omit<User, 'userId' | 'createdAt'>): Promise<User> {
    const db = await getDatabase();
    const userId = `USR-${Date.now()}`;
    
    const user: User = {
      ...userData,
      userId,
      createdAt: new Date(),
    };

    await db.collection<User>(this.collectionName).insertOne(user);
    return user;
  }
}
\`\`\`

**Where we did this:** `lib/repositories/user-repository.ts`

**Quality Impact:** Non-blocking operations, better error handling, atomic operations.

---

#### Refactoring 2: Extract UI Logic from Business Classes

**Before (Java - POSSystem.java):**
\`\`\`java
public void login() {
    JPanel panel = new JPanel(new GridLayout(2, 2));
    JTextField userField = new JTextField(15);
    // ... UI setup mixed with authentication logic
    
    if (result == JOptionPane.OK_OPTION) {
        Employee emp = getEmployeeFromFile(username);
        if (emp != null && emp.getPassword().equals(password)) {
            if (emp.getPosition().equals("Admin")) {
                showAdminMenu();
            }
        }
    }
}
\`\`\`

**After (TypeScript - Separated files):**

**auth-service.ts:**
\`\`\`typescript
export class AuthService {
  async login(username: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByUsername(username.toLowerCase());
    
    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid credentials' };
    }

    await this.logAuditEvent(user.userId, user.name, user.role, 'login');

    return {
      success: true,
      user: { ...user, password: undefined },
      redirectTo: user.role === 'admin' ? '/admin' : '/cashier',
    };
  }
}
\`\`\`

**Where we did this:** `lib/services/auth-service.ts` and `app/login/page.tsx`

**Quality Impact:** Testable authentication logic, reusable service, clear separation of concerns.

---

#### Refactoring 3: Replace Manual String Parsing with Typed Models

**Before (Java):**
\`\`\`java
String line = "110001 Admin Harry Larry password123";
String[] parts = line.split(" ");
String id = parts[0];
String position = parts[1];
\`\`\`

**After (TypeScript - models.ts):**
\`\`\`typescript
export interface User {
  userId: string;
  legacyId?: string;
  username: string;
  password: string;
  role: 'admin' | 'manager' | 'cashier';
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}
\`\`\`

**Where we did this:** `lib/types/models.ts`

**Quality Impact:** Compile-time type checking, IDE autocompletion, self-documenting code.

---

### 8.3 Saima's Refactorings

#### Refactoring 1: Replace Manual UI Updates with React State Management

**Before (Java - Transaction_Interface.java):**
\`\`\`java
public void itemAdded(Item item) {
    updateItemTable();
    updateTotalLabel();
    updateTaxLabel();
    updateFinalTotalLabel();
    enablePayButton();
}
\`\`\`

**After (TypeScript - transaction/page.tsx):**
\`\`\`typescript
export default function TransactionPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Derived state - automatically recalculates
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  
  // UI automatically updates when cart changes!
}
\`\`\`

**Where we did this:** `app/transaction/page.tsx`

**Quality Impact:** Automatic UI updates, no manual synchronization, predictable state.

---

#### Refactoring 2: Extract Validation Logic

**Before (Java - validation mixed with processing):**
\`\`\`java
public void processReturn(String phone, String itemId) {
    if (phone == null || phone.length() != 10) {
        JOptionPane.showMessageDialog(null, "Invalid phone");
        return;
    }
    // More validation mixed in...
}
\`\`\`

**After (TypeScript - customer-service.ts):**
\`\`\`typescript
export class CustomerService {
  validatePhone(phone: string): boolean {
    const phoneNum = Number.parseInt(phone, 10);
    return phoneNum >= 1000000000 && phoneNum <= 9999999999;
  }
}
\`\`\`

**Where we did this:** `lib/services/customer-service.ts`

**Quality Impact:** Reusable validation, consistent error handling, testable logic.

---

#### Refactoring 3: Replace Procedural Report Generation with Structured Data

**Before (Java):**
\`\`\`java
StringBuilder sb = new StringBuilder();
sb.append("SG Technologies\n");
sb.append("================\n");
sb.append("Total: $" + total + "\n");
JOptionPane.showMessageDialog(null, sb.toString());
\`\`\`

**After (TypeScript):**
\`\`\`typescript
const transaction: Transaction = {
  transactionId: `TXN-${Date.now()}`,
  type: "sale",
  items: transactionItems,
  subtotal,
  tax,
  total,
  createdAt: new Date(),
};

// UI renders structured data
<p className="text-2xl">${total.toFixed(2)}</p>
\`\`\`

**Where we did this:** `app/transaction/page.tsx` and `lib/services/transaction-service.ts`

**Quality Impact:** Separation of data from presentation, reusable transaction format.

---

## 9. Reengineering Plan & Timeline

### 9.1 Project Phases

\`\`\`mermaid
gantt
    title POS System Reengineering Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Analysis
    Inventory Legacy System     :done, p1a, 2024-11-01, 3d
    Document Current Architecture :done, p1b, after p1a, 2d
    Identify Pain Points        :done, p1c, after p1b, 2d
    
    section Phase 2: Reverse Engineering
    Extract Business Rules      :done, p2a, 2024-11-08, 3d
    Document Data Structures    :done, p2b, after p2a, 2d
    Map Component Dependencies  :done, p2c, after p2b, 2d
    
    section Phase 3: Restructuring
    Design New Architecture     :done, p3a, 2024-11-15, 3d
    Define Database Schema      :done, p3b, after p3a, 2d
    Create Migration Plan       :done, p3c, after p3b, 2d
    
    section Phase 4: Forward Engineering
    Setup Project Structure     :done, p4a, 2024-11-22, 2d
    Implement Data Layer        :done, p4b, after p4a, 3d
    Implement Business Layer    :done, p4c, after p4b, 4d
    Implement UI Layer          :done, p4d, after p4c, 5d
    
    section Phase 5: Migration
    Create Migration Scripts    :done, p5a, 2024-12-05, 2d
    Execute Data Migration      :done, p5b, after p5a, 1d
    Verify Data Integrity       :done, p5c, after p5b, 1d
\`\`\`

### 9.2 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | Low | High | Backup all .txt files, validation scripts |
| Feature parity gaps | Medium | Medium | Comprehensive feature mapping checklist |
| Performance issues | Low | Medium | MongoDB indexing, query optimization |

---

## 10. Design Patterns

### 10.1 Patterns Used

\`\`\`mermaid
flowchart TD
    subgraph Patterns["Design Patterns Applied"]
        subgraph Creational
            S[Singleton - DB Connection]
        end
        
        subgraph Structural
            R[Repository - Data Access]
            A[Adapter - Legacy ID Mapping]
        end
        
        subgraph Behavioral
            O[Observer - React State]
            ST[Strategy - Payment Methods]
        end
    end
\`\`\`

---

## 11. Improved Architecture Justification

### Fully Implemented Improved Architecture with Clear Layers

The reengineered POS system demonstrates a **fully implemented improved architecture** that addresses all shortcomings of the legacy Java Swing application. The architecture is organized into three distinct layers:

**Presentation Layer (app/, components/):** Built with React and Next.js 15, providing a modern, responsive user interface. Unlike the legacy Swing UI that mixed business logic with presentation code, our React components are purely presentational. They receive data through props and hooks, render UI elements, and dispatch user actions to the business layer.

**Business Logic Layer (lib/services/):** Contains all core functionality extracted and centralized from scattered Java classes. The TransactionService handles all transaction types (sales, rentals, returns) with consistent validation, calculation, and processing logic. The AuthService manages authentication and audit logging. By centralizing business logic in services, we achieved testable, reusable, and maintainable code.

**Data Access Layer (lib/repositories/, lib/db/):** Implements the Repository Pattern, providing a clean abstraction over MongoDB operations. Each repository encapsulates all database queries for its domain entity. The BaseRepository provides common CRUD operations while specific repositories add domain-specific queries.

---

## 12. Comprehensive Refactoring Summary

### How We Achieved Improved Modularity and Clarity

The refactoring effort focused on three key areas: **extracting mixed concerns**, **establishing clear boundaries**, and **standardizing patterns**.

**Extracting Mixed Concerns:** In the legacy system, UI code, business logic, and data access were intertwined. We systematically extracted each concern into separate layers.

**Establishing Clear Boundaries:** We defined explicit contracts between layers using TypeScript interfaces. The boundaries prevent accidental coupling and make the system easier to understand and modify.

**Standardizing Patterns:** Instead of ad-hoc approaches, we established consistent patterns: all data access through repositories, all business operations through services, all API endpoints following REST conventions.

---

## 13. Normalized Schema & Data Migration Rationale

### Well-Justified Data Migration

The migration from text files to MongoDB represents a fundamental improvement:

1. **From Flat Files to Collections:** Solved problems of no data type enforcement, no referential integrity, no concurrent access handling, and inefficient querying.

2. **Schema Normalization:** Eliminated redundancy and established relationships:
   - Users: Proper typed fields, unique constraints, audit log relationships
   - Products: Unified sale + rental items with isRentable flag
   - Customers: Normalized rental history with embedded arrays
   - Transactions: Full item details with cashier references

3. **Data Integrity Preservation:** All legacy IDs preserved in legacyId fields for traceability.

---

## 14. Setup Instructions

### 14.1 Step-by-Step Installation

\`\`\`bash
# 1. Download project from v0 preview

# 2. Navigate to project
cd pos-system

# 3. Install dependencies
npm install

# 4. Create .env.local
\`\`\`

### 14.2 Environment Configuration

Create `.env.local` in project root:

\`\`\`env
MONGODB_URI=mongodb+srv://i222657:goku1356@a3p2.p7u3y.mongodb.net/?retryWrites=true&w=majority&appName=a3p2
MONGODB_DB=pos_system
JWT_SECRET=your-super-secret-jwt-key-change-this
\`\`\`

### 14.3 Migration Command

\`\`\`bash
npx tsx scripts/migrate-legacy-data.ts
\`\`\`

### 14.4 Start Application

\`\`\`bash
npm run dev
# Open http://localhost:3000
\`\`\`

### 14.5 Login Credentials

| Username | Password | Role |
|----------|----------|------|
| harrylarry | 1 | Admin |
| claytonwatson | lehigh2017 | Admin |
| debracooper | lehigh2016 | Cashier |
| sethmoss | lehigh2018 | Cashier |

---

*Document Version: 3.0*
*Last Updated: December 2024*
*Team: Ali, Khawar, Saima*
