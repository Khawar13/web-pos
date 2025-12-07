// User Repository - User/Employee data access

import { BaseRepository } from "./base-repository"
import type { User } from "../types/models"

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("users", "userId")
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username } as any)
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ isActive: true } as any)
  }

  async updateLastLogin(userId: string): Promise<User | null> {
    const collection = await this.getCollection()
    await collection.updateOne({ userId } as any, { $set: { lastLogin: new Date() } } as any)
    return this.findById(userId)
  }
}

export const userRepository = new UserRepository()
