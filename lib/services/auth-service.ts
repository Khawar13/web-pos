// Business Logic Layer - Authentication Service
// Reengineered from POSSystem.java logIn/logOut methods
// Handles user authentication and session management

import type { User, UserRole } from "../types/models"
import { userRepository } from "../repositories"
import { eventService } from "./event-service"
import { database } from "../db/mongodb"

export class AuthService {
  // Login (from POSSystem.logIn)
  async login(username: string, password: string): Promise<{ user: User | null; role: number }> {
    const user = await userRepository.findByUsername(username)

    if (!user || !user.isActive) {
      return { user: null, role: 0 } // 0 = auth failed (from original)
    }

    // In production, use bcrypt to compare hashed passwords
    if (user.password !== password) {
      return { user: null, role: 0 }
    }

    // Update last login
    await userRepository.update(user.userId, { lastLogin: new Date() })

    // Save audit log to database
    try {
      const db = await database.connect()
      await db.collection("audit_logs").insertOne({
        logId: `LOG-${Date.now()}`,
        userId: user.userId,
        userName: user.name,
        userRole: user.role,
        action: "login",
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Failed to save login audit log:", error)
    }

    eventService.emit("user_login", `User ${user.name} logged in`, { userId: user.userId })

    // Return role code like original Java system
    // 1 = Cashier, 2 = Admin
    const roleCode = user.role === "admin" ? 2 : user.role === "manager" ? 2 : 1

    return { user, role: roleCode }
  }

  // Logout (from POSSystem.logOut)
  async logout(userId: string, position: string): Promise<void> {
    // Get user info for audit log
    const user = await userRepository.findById(userId)

    if (user) {
      // Save logout audit log to database
      try {
        const db = await database.connect()
        await db.collection("audit_logs").insertOne({
          logId: `LOG-${Date.now()}`,
          userId: user.userId,
          userName: user.name,
          userRole: user.role,
          action: "logout",
          timestamp: new Date(),
        })
      } catch (error) {
        console.error("Failed to save logout audit log:", error)
      }
    }

    eventService.emit("user_logout", `User logged out from ${position}`, { userId })
  }

  async createUser(userData: Omit<User, "_id" | "userId" | "createdAt">): Promise<User> {
    const user: User = {
      ...userData,
      userId: `USR-${Date.now()}`,
      createdAt: new Date(),
    }

    return userRepository.create(user as User & Document) as unknown as User
  }

  async getAllUsers(): Promise<User[]> {
    return userRepository.findAll() as unknown as User[]
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    return userRepository.update(userId, updates) as unknown as User
  }

  hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole)
  }
}

export const authService = new AuthService()
