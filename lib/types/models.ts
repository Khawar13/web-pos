// Domain Models - Centralized Type Definitions
// These represent the core business entities of the POS system
// Reengineered from original Java classes: Item, Employee, ReturnItem, Customer

export interface Product {
  _id?: string
  productId: string // Maps to original itemId (e.g., "1000")
  legacyId?: string // Preserve original ID for reference
  name: string
  description?: string
  price: number
  cost?: number
  quantity: number
  category?: string // "sale" | "rental"
  barcode?: string
  imageUrl?: string
  isActive?: boolean
  isRentable?: boolean // true for rental items from rentalDatabase
  rentalPricePerDay?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Category {
  _id?: string
  categoryId: string
  name: string
  description: string
  isActive: boolean
}

export interface Customer {
  _id?: string
  customerId: string
  name: string
  email: string
  phone: string // Used as lookup key in original system
  address: string
  loyaltyPoints: number
  rentals: RentalRecord[]
  createdAt: Date
}

export interface RentalRecord {
  productId: string
  productName: string
  quantity: number
  rentedAt: Date
  dueDate: Date
  returnedAt?: Date
  isReturned: boolean
  lateFeePerDay: number
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
  discount: number
  transactionType: TransactionType
}

export type TransactionType = "sale" | "rental" | "return"

export interface Transaction {
  _id?: string
  transactionId: string
  type: TransactionType
  items: TransactionItem[]
  customerId?: string
  customerPhone?: string
  subtotal: number
  tax: number
  taxRate: number // Store the tax rate used (6% in original)
  discount: number
  total: number
  lateFees?: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  cashierId: string
  cashierName?: string
  couponCode?: string
  createdAt: Date
  legacyTimestamp?: string // Preserve original timestamp format
}

export interface TransactionItem {
  productId: string
  legacyProductId: string // Original itemId from txt files
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  daysLate?: number
  lateFee?: number
}

export interface User {
  _id?: string
  userId: string
  legacyId?: string // Original employee ID (e.g., "110001") - optional for new users
  username: string
  password: string // In production, this should be hashed
  role: UserRole
  firstName: string
  lastName: string
  name: string // Computed: firstName + lastName
  email: string
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface AuditLog {
  _id?: string
  logId: string
  userId: string
  userName: string
  userRole: UserRole
  action: "login" | "logout"
  timestamp: Date
  legacyTimestamp?: string
}

export interface Coupon {
  _id?: string
  code: string // Original format: C001, C002, etc.
  discountPercent: number // Default 10% as per original system
  isActive: boolean
  usedCount: number
  expiresAt?: Date
}

export interface ReturnRecord {
  _id?: string
  returnId: string
  items: TransactionItem[]
  originalTransactionId?: string
  processedAt: Date
  processedBy?: string
  refundAmount: number
}

export type PaymentMethod = "cash" | "card" | "mobile" | "credit"
export type PaymentStatus = "completed" | "pending" | "refunded" | "cancelled"
export type UserRole = "admin" | "cashier" | "manager"

// Observer Pattern - Event types for system notifications
export type POSEvent =
  | "product_added"
  | "product_updated"
  | "sale_completed"
  | "rental_completed"
  | "return_completed"
  | "low_stock"
  | "user_login"
  | "user_logout"
  | "inventory_updated"

export interface POSNotification {
  event: POSEvent
  message: string
  data?: unknown
  timestamp: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
