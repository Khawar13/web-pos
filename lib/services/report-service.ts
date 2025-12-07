// Business Logic Layer - Report Service
// Generates business reports and analytics

import { transactionRepository } from "../repositories"
import { productRepository } from "../repositories"
import type { Transaction, Product } from "../types/models"

export interface SalesReport {
  period: string
  totalSales: number
  transactionCount: number
  averageTransactionValue: number
  topProducts: { productName: string; quantity: number; revenue: number }[]
  paymentMethodBreakdown: { method: string; count: number; total: number }[]
}

export interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockItems: Product[]
  outOfStockItems: Product[]
  categoryBreakdown: { category: string; count: number; value: number }[]
}

export class ReportService {
  async generateSalesReport(startDate: Date, endDate: Date): Promise<SalesReport> {
    const transactions = (await transactionRepository.findByDateRange(startDate, endDate)) as unknown as Transaction[]

    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)
    const transactionCount = transactions.length
    const averageTransactionValue = transactionCount > 0 ? totalSales / transactionCount : 0

    // Calculate top products
    const productSales = new Map<string, { quantity: number; revenue: number }>()
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        const existing = productSales.get(item.productName) || { quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.subtotal
        productSales.set(item.productName, existing)
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([productName, data]) => ({ productName, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Payment method breakdown
    const paymentMethods = new Map<string, { count: number; total: number }>()
    transactions.forEach((t) => {
      const existing = paymentMethods.get(t.paymentMethod) || { count: 0, total: 0 }
      existing.count++
      existing.total += t.total
      paymentMethods.set(t.paymentMethod, existing)
    })

    const paymentMethodBreakdown = Array.from(paymentMethods.entries()).map(([method, data]) => ({ method, ...data }))

    return {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      totalSales,
      transactionCount,
      averageTransactionValue,
      topProducts,
      paymentMethodBreakdown,
    }
  }

  async generateInventoryReport(): Promise<InventoryReport> {
    const products = (await productRepository.findAll()) as unknown as Product[]

    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
    const lowStockItems = products.filter((p) => p.quantity > 0 && p.quantity <= 10)
    const outOfStockItems = products.filter((p) => p.quantity === 0)

    // Category breakdown
    const categories = new Map<string, { count: number; value: number }>()
    products.forEach((p) => {
      const existing = categories.get(p.category) || { count: 0, value: 0 }
      existing.count++
      existing.value += p.price * p.quantity
      categories.set(p.category, existing)
    })

    const categoryBreakdown = Array.from(categories.entries()).map(([category, data]) => ({ category, ...data }))

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      categoryBreakdown,
    }
  }

  async getDashboardStats(): Promise<{
    todaySales: number
    todayTransactions: number
    lowStockCount: number
    totalProducts: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTransactions = (await transactionRepository.findByDateRange(today, tomorrow)) as unknown as Transaction[]
    const products = (await productRepository.findAll()) as unknown as Product[]

    return {
      todaySales: todayTransactions.reduce((sum, t) => sum + t.total, 0),
      todayTransactions: todayTransactions.length,
      lowStockCount: products.filter((p) => p.quantity <= 10).length,
      totalProducts: products.length,
    }
  }
}

export const reportService = new ReportService()
