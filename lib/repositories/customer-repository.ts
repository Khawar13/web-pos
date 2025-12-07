// Customer Repository - Customer data access
// Reengineered from Management.java with rental tracking

import { BaseRepository } from "./base-repository"
import type { Customer, RentalRecord } from "../types/models"

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super("customers", "customerId")
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return this.findOne({ phone } as any)
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.findOne({ email } as any)
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const collection = await this.getCollection()
    return collection
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
        ],
      } as any)
      .toArray() as Promise<Customer[]>
  }

  async updateLoyaltyPoints(customerId: string, points: number): Promise<Customer | null> {
    const collection = await this.getCollection()
    await collection.updateOne({ customerId } as any, { $inc: { loyaltyPoints: points } } as any)
    return this.findById(customerId)
  }

  async addRental(customerId: string, rental: RentalRecord): Promise<Customer | null> {
    const collection = await this.getCollection()
    await collection.updateOne({ customerId } as any, { $push: { rentals: rental } } as any)
    return this.findById(customerId)
  }

  async getOutstandingRentals(customerId: string): Promise<RentalRecord[]> {
    const customer = await this.findById(customerId)
    if (!customer) return []
    return customer.rentals?.filter((r) => !r.isReturned) || []
  }

  async markRentalReturned(customerId: string, productId: string): Promise<Customer | null> {
    const collection = await this.getCollection()
    await collection.updateOne(
      { customerId, "rentals.productId": productId, "rentals.isReturned": false } as any,
      { $set: { "rentals.$.isReturned": true, "rentals.$.returnedAt": new Date() } } as any,
    )
    return this.findById(customerId)
  }
}

export const customerRepository = new CustomerRepository()
