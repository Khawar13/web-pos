// Business Logic Layer - Customer Service
// Reengineered from Management.java
// Handles customer management and rental tracking

import type { Customer } from "../types/models"
import { customerRepository } from "../repositories"

export class CustomerService {
  // Check if customer exists (from Management.checkUser)
  async checkUser(phone: string): Promise<boolean> {
    const customer = await customerRepository.findByPhone(phone)
    return customer !== null
  }

  // Create new customer (from Management.createUser)
  async createUser(phone: string, name?: string): Promise<Customer | null> {
    try {
      const customer: Customer = {
        customerId: `CUST-${Date.now()}`,
        name: name || "Customer",
        email: "",
        phone,
        address: "",
        loyaltyPoints: 0,
        rentals: [],
        createdAt: new Date(),
      }

      return customerRepository.create(customer as Customer & Document) as unknown as Customer
    } catch {
      return null
    }
  }

  // Get outstanding rentals with days late (from Management.getLatestReturnDate)
  async getOutstandingRentals(phone: string): Promise<
    {
      productId: string
      productName: string
      quantity: number
      daysLate: number
      dueDate: Date
      lateFeePerDay: number
    }[]
  > {
    const customer = await customerRepository.findByPhone(phone)
    if (!customer || !customer.rentals) return []

    const now = new Date()
    return customer.rentals
      .filter((r) => !r.isReturned)
      .map((r) => {
        const dueDate = new Date(r.dueDate)
        const diffTime = now.getTime() - dueDate.getTime()
        const daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

        return {
          productId: r.productId,
          productName: r.productName,
          quantity: r.quantity,
          daysLate,
          dueDate,
          lateFeePerDay: r.lateFeePerDay,
        }
      })
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    return customerRepository.findByPhone(phone) as unknown as Customer
  }

  async getAllCustomers(): Promise<Customer[]> {
    return customerRepository.findAll() as unknown as Customer[]
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return customerRepository.searchCustomers(query) as unknown as Customer[]
  }

  // Validate phone number (10 digits like original)
  validatePhone(phone: string): boolean {
    const phoneNum = Number.parseInt(phone, 10)
    return phoneNum >= 1000000000 && phoneNum <= 9999999999
  }
}

export const customerService = new CustomerService()
