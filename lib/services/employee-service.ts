// Business Logic Layer - Employee Service
// Reengineered from EmployeeManagement.java
// Handles employee CRUD operations

import type { User, UserRole } from "../types/models"
import { userRepository } from "../repositories"

export class EmployeeService {
  // Add new employee (from EmployeeManagement.add)
  async addEmployee(name: string, password: string, role: UserRole, email?: string): Promise<User> {
    const userId = `USR-${Date.now()}`
    const username = userId.toLowerCase()

    const user: User = {
      userId,
      username,
      password, // In production, hash with bcrypt
      role,
      name,
      email: email || "",
      isActive: true,
      createdAt: new Date(),
    }

    const created = await userRepository.create(user as User & Document)
    return created as unknown as User
  }

  // Delete employee (from EmployeeManagement.delete)
  async deleteEmployee(userId: string): Promise<boolean> {
    const user = await userRepository.findById(userId)
    if (!user) return false

    return userRepository.delete(userId)
  }

  // Update employee (from EmployeeManagement.update)
  async updateEmployee(
    username: string,
    updates: {
      password?: string
      position?: UserRole
      name?: string
    },
  ): Promise<{ success: boolean; error?: string }> {
    const user = await userRepository.findByUsername(username)
    if (!user) {
      return { success: false, error: "Employee not found" }
    }

    if (updates.position && !["admin", "cashier", "manager"].includes(updates.position)) {
      return { success: false, error: "Invalid position" }
    }

    const updateData: Partial<User> = {}
    if (updates.password) updateData.password = updates.password
    if (updates.position) updateData.role = updates.position
    if (updates.name) updateData.name = updates.name

    await userRepository.update(user.userId, updateData)
    return { success: true }
  }

  // Get all employees (from EmployeeManagement.getEmployeeList)
  async getAllEmployees(): Promise<User[]> {
    return userRepository.findAll() as unknown as User[]
  }

  async getActiveEmployees(): Promise<User[]> {
    return userRepository.findActiveUsers() as unknown as User[]
  }

  async getEmployeeById(userId: string): Promise<User | null> {
    return userRepository.findById(userId) as unknown as User
  }

  async getEmployeeByUsername(username: string): Promise<User | null> {
    return userRepository.findByUsername(username) as unknown as User
  }

  // Deactivate employee instead of hard delete
  async deactivateEmployee(userId: string): Promise<boolean> {
    const result = await userRepository.update(userId, { isActive: false })
    return result !== null
  }
}

export const employeeService = new EmployeeService()
