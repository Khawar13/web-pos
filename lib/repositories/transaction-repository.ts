// Transaction Repository - Handles sales data access

import { BaseRepository } from "./base-repository"
import type { Transaction } from "../types/models"

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super("transactions", "transactionId")
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const collection = await this.getCollection()
    return collection
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      } as any)
      .toArray() as Promise<Transaction[]>
  }

  async findByCustomer(customerId: string): Promise<Transaction[]> {
    return this.find({ customerId } as any)
  }

  async findByCashier(cashierId: string): Promise<Transaction[]> {
    return this.find({ cashierId } as any)
  }

  async getTodaySales(): Promise<Transaction[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return this.findByDateRange(today, tomorrow)
  }

  async getSalesReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalSales: number
    totalTransactions: number
    averageTransaction: number
  }> {
    const transactions = await this.findByDateRange(startDate, endDate)
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)
    return {
      totalSales,
      totalTransactions: transactions.length,
      averageTransaction: transactions.length > 0 ? totalSales / transactions.length : 0,
    }
  }
}

export const transactionRepository = new TransactionRepository()
