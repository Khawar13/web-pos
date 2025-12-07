// Business Logic Layer - Transaction Service
// Reengineered from POS.java, POR.java, POH.java
// Handles sales, rentals, and returns processing

import type {
  Transaction,
  TransactionItem,
  PaymentMethod,
  CartItem,
  TransactionType,
  RentalRecord,
} from "../types/models"
import { transactionRepository, customerRepository, couponRepository } from "../repositories"
import { productService } from "./product-service"
import { eventService } from "./event-service"

export class TransactionService {
  private readonly TAX_RATE = 0.06 // 6% tax from original PointOfSale.java
  private readonly DISCOUNT_RATE = 0.1 // 10% coupon discount
  private readonly LATE_FEE_RATE = 0.1 // 10% per day late fee
  private readonly RENTAL_DAYS = 14 // 14 days rental period

  // Process a sale transaction (from POS.java)
  async processSale(
    items: CartItem[],
    paymentMethod: PaymentMethod,
    cashierId: string,
    couponCode?: string,
    customerId?: string,
  ): Promise<Transaction> {
    let discount = 0

    // Apply coupon if provided (from PointOfSale.coupon())
    if (couponCode) {
      const coupon = await couponRepository.findActiveByCode(couponCode)
      if (coupon) {
        discount = coupon.discountPercent / 100
      }
    }

    const transactionItems: TransactionItem[] = items.map((item) => ({
      productId: item.product.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      subtotal: item.subtotal,
      discount: item.discount,
    }))

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const discountAmount = subtotal * discount
    const taxableAmount = subtotal - discountAmount
    const tax = taxableAmount * this.TAX_RATE
    const total = taxableAmount + tax

    const transaction: Transaction = {
      transactionId: `TXN-${Date.now()}`,
      type: "sale",
      items: transactionItems,
      customerId,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentStatus: "completed",
      cashierId,
      couponCode,
      createdAt: new Date(),
    }

    const saved = await transactionRepository.create(transaction as Transaction & Document)

    // Update inventory (from Inventory.updateInventory)
    for (const item of items) {
      await productService.updateStock(item.product.productId, -item.quantity)
    }

    eventService.emit("sale_completed", `Sale completed: $${total.toFixed(2)}`, saved)

    return saved as unknown as Transaction
  }

  // Process a rental transaction (from POR.java)
  async processRental(
    items: CartItem[],
    paymentMethod: PaymentMethod,
    cashierId: string,
    customerPhone: string,
  ): Promise<Transaction> {
    // Find or create customer
    let customer = await customerRepository.findByPhone(customerPhone)
    if (!customer) {
      customer = (await customerRepository.create({
        customerId: `CUST-${Date.now()}`,
        name: "Customer",
        email: "",
        phone: customerPhone,
        address: "",
        loyaltyPoints: 0,
        rentals: [],
        createdAt: new Date(),
      } as any)) as any
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + this.RENTAL_DAYS)

    const transactionItems: TransactionItem[] = items.map((item) => ({
      productId: item.product.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.rentalPricePerDay || item.product.price,
      subtotal: item.quantity * (item.product.rentalPricePerDay || item.product.price),
      discount: 0,
    }))

    const subtotal = transactionItems.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * this.TAX_RATE
    const total = subtotal + tax

    const transaction: Transaction = {
      transactionId: `RNT-${Date.now()}`,
      type: "rental",
      items: transactionItems,
      customerId: customer.customerId,
      customerPhone,
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod,
      paymentStatus: "completed",
      cashierId,
      createdAt: new Date(),
    }

    const saved = await transactionRepository.create(transaction as Transaction & Document)

    // Add rental records to customer (from Management.addRental)
    for (const item of items) {
      const rentalRecord: RentalRecord = {
        productId: item.product.productId,
        productName: item.product.name,
        quantity: item.quantity,
        rentedAt: new Date(),
        dueDate,
        isReturned: false,
        lateFeePerDay: item.product.price * this.LATE_FEE_RATE,
      }
      await customerRepository.addRental(customer.customerId, rentalRecord)
    }

    // Update inventory
    for (const item of items) {
      await productService.updateStock(item.product.productId, -item.quantity)
    }

    eventService.emit("rental_completed", `Rental completed: $${total.toFixed(2)}`, saved)

    return saved as unknown as Transaction
  }

  // Process a return transaction (from POH.java)
  async processReturn(
    items: { productId: string; productName: string; quantity: number; daysLate: number; originalPrice: number }[],
    paymentMethod: PaymentMethod,
    cashierId: string,
    customerPhone: string,
    isRentalReturn: boolean,
  ): Promise<Transaction> {
    const customer = await customerRepository.findByPhone(customerPhone)

    const transactionItems: TransactionItem[] = items.map((item) => {
      const lateFee = isRentalReturn ? item.originalPrice * this.LATE_FEE_RATE * item.daysLate * item.quantity : 0
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.originalPrice,
        subtotal: isRentalReturn ? 0 : item.originalPrice * item.quantity,
        discount: 0,
        daysLate: item.daysLate,
        lateFee,
      }
    })

    const lateFees = transactionItems.reduce((sum, item) => sum + (item.lateFee || 0), 0)
    const refundAmount = isRentalReturn ? 0 : transactionItems.reduce((sum, item) => sum + item.subtotal, 0)

    const transaction: Transaction = {
      transactionId: `RTN-${Date.now()}`,
      type: "return",
      items: transactionItems,
      customerId: customer?.customerId,
      customerPhone,
      subtotal: refundAmount,
      tax: 0,
      discount: 0,
      total: isRentalReturn ? lateFees : -refundAmount,
      lateFees,
      paymentMethod,
      paymentStatus: "completed",
      cashierId,
      createdAt: new Date(),
    }

    const saved = await transactionRepository.create(transaction as Transaction & Document)

    // Update inventory - add items back
    for (const item of items) {
      await productService.updateStock(item.productId, item.quantity)
    }

    // Mark rentals as returned
    if (isRentalReturn && customer) {
      for (const item of items) {
        await customerRepository.markRentalReturned(customer.customerId, item.productId)
      }
    }

    eventService.emit("return_completed", `Return processed`, saved)

    return saved as unknown as Transaction
  }

  // Validate credit card (from PointOfSale.creditCard)
  validateCreditCard(cardNumber: string): boolean {
    if (cardNumber.length !== 16) return false
    return /^\d{16}$/.test(cardNumber)
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    return transactionRepository.findById(transactionId) as unknown as Transaction
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return transactionRepository.findAll() as unknown as Transaction[]
  }

  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    return transactionRepository.find({ type } as any) as unknown as Transaction[]
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return transactionRepository.findByDateRange(startDate, endDate) as unknown as Transaction[]
  }

  async getTodayTransactions(): Promise<Transaction[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return this.getTransactionsByDateRange(today, tomorrow)
  }

  async getDailySummary(): Promise<{
    totalSales: number
    totalRentals: number
    totalReturns: number
    transactionCount: number
  }> {
    const transactions = await this.getTodayTransactions()
    const sales = transactions.filter((t) => t.type === "sale")
    const rentals = transactions.filter((t) => t.type === "rental")
    const returns = transactions.filter((t) => t.type === "return")

    return {
      totalSales: sales.reduce((sum, t) => sum + t.total, 0),
      totalRentals: rentals.reduce((sum, t) => sum + t.total, 0),
      totalReturns: returns.reduce((sum, t) => sum + Math.abs(t.total), 0),
      transactionCount: transactions.length,
    }
  }
}

export const transactionService = new TransactionService()
