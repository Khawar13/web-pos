/**
 * Database Seeding Script (Quick Setup)
 *
 * This is a simplified version for quick testing.
 * For full legacy data migration, use: npx tsx scripts/migrate-legacy-data.ts
 *
 * Run: npx tsx scripts/seed-database.ts
 */

import { MongoClient } from "mongodb"

const MONGODB_URI = "mongodb+srv://i222657:goku1356@a3p2.p7u3y.mongodb.net/?retryWrites=true&w=majority&appName=a3p2"
const DB_NAME = "pos_system"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✓ Connected to MongoDB Atlas")

    const db = client.db(DB_NAME)

    // Check if data already exists
    const userCount = await db.collection("users").countDocuments()
    if (userCount > 0) {
      console.log("\n⚠️  Database already has data. Skipping seed.")
      console.log("   To reset, run: npx tsx scripts/migrate-legacy-data.ts")
      return
    }

    console.log("\n📦 Seeding basic data...")

    // Seed basic users for testing
    const users = [
      {
        userId: "USR-001",
        legacyId: "110001",
        username: "admin",
        password: "admin123",
        role: "admin",
        firstName: "System",
        lastName: "Admin",
        name: "System Admin",
        email: "admin@sgtech.com",
        isActive: true,
        createdAt: new Date(),
      },
      {
        userId: "USR-002",
        legacyId: "110002",
        username: "cashier",
        password: "cashier123",
        role: "cashier",
        firstName: "Test",
        lastName: "Cashier",
        name: "Test Cashier",
        email: "cashier@sgtech.com",
        isActive: true,
        createdAt: new Date(),
      },
    ]

    await db.collection("users").insertMany(users)
    console.log("   ✓ Created test users")

    // Seed sample products
    const products = [
      {
        productId: "PRD-S1000",
        legacyId: "1000",
        name: "Potato",
        description: "Fresh potatoes",
        price: 1.0,
        cost: 0.6,
        quantity: 249,
        category: "Groceries",
        barcode: "1000",
        isActive: true,
        isRentable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-S1002",
        legacyId: "1002",
        name: "SkirtSteak",
        description: "Premium skirt steak",
        price: 15.0,
        cost: 9.0,
        quantity: 1055,
        category: "Groceries",
        barcode: "1002",
        isActive: true,
        isRentable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-R1000",
        legacyId: "R1000",
        name: "TheoryOfEverything",
        description: "Rental: Theory of Everything DVD",
        price: 90.0,
        cost: 60.0,
        quantity: 249,
        category: "Rentals",
        barcode: "R1000",
        isActive: true,
        isRentable: true,
        rentalPricePerDay: 30.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("products").insertMany(products)
    console.log("   ✓ Created sample products")

    // Seed categories
    const categories = [
      { categoryId: "CAT-001", name: "Groceries", description: "Food items", isActive: true },
      { categoryId: "CAT-002", name: "Rentals", description: "Rental items", isActive: true },
    ]

    await db.collection("categories").insertMany(categories)
    console.log("   ✓ Created categories")

    // Seed sample coupons
    const coupons = [
      { code: "C001", discountPercent: 10, isActive: true, usedCount: 0 },
      { code: "C002", discountPercent: 10, isActive: true, usedCount: 0 },
      { code: "C003", discountPercent: 10, isActive: true, usedCount: 0 },
    ]

    await db.collection("coupons").insertMany(coupons)
    console.log("   ✓ Created sample coupons")

    console.log("\n✅ Seed completed successfully!")
    console.log("\n🔑 Login Credentials:")
    console.log("   Admin:   admin / admin123")
    console.log("   Cashier: cashier / cashier123")
    console.log("\n💡 For full legacy data migration, run:")
    console.log("   npx tsx scripts/migrate-legacy-data.ts")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
