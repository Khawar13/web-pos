// MongoDB Seed Data Script
// Run this using: node scripts/002-seed-data.js

const { MongoClient } = require("mongodb")

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://i222657:goku1356@a3p2.p7u3y.mongodb.net/?retryWrites=true&w=majority&appName=a3p2"

async function seedDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB Atlas")

    const db = client.db("pos_system")

    // Seed Categories
    const categories = [
      { categoryId: "CAT-001", name: "Beverages", description: "Drinks and beverages", isActive: true },
      { categoryId: "CAT-002", name: "Food", description: "Food items", isActive: true },
      { categoryId: "CAT-003", name: "Groceries", description: "Grocery items", isActive: true },
      { categoryId: "CAT-004", name: "Electronics", description: "Electronic items", isActive: true },
      { categoryId: "CAT-005", name: "Health", description: "Health and wellness", isActive: true },
    ]

    await db.collection("categories").deleteMany({})
    await db.collection("categories").insertMany(categories)
    console.log("Categories seeded")

    // Seed Products
    const products = [
      {
        productId: "PRD-001",
        name: "Coffee",
        description: "Fresh brewed coffee",
        price: 3.99,
        cost: 1.5,
        quantity: 100,
        category: "beverages",
        barcode: "1234567890",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-002",
        name: "Tea",
        description: "Assorted tea bags",
        price: 2.99,
        cost: 1.0,
        quantity: 150,
        category: "beverages",
        barcode: "1234567891",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-003",
        name: "Sandwich",
        description: "Fresh deli sandwich",
        price: 7.99,
        cost: 3.5,
        quantity: 30,
        category: "food",
        barcode: "1234567892",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-004",
        name: "Salad",
        description: "Garden fresh salad",
        price: 6.99,
        cost: 2.5,
        quantity: 25,
        category: "food",
        barcode: "1234567893",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-005",
        name: "Water Bottle",
        description: "500ml mineral water",
        price: 1.99,
        cost: 0.5,
        quantity: 200,
        category: "beverages",
        barcode: "1234567894",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-006",
        name: "Chips",
        description: "Potato chips pack",
        price: 2.49,
        cost: 1.0,
        quantity: 80,
        category: "groceries",
        barcode: "1234567895",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-007",
        name: "Chocolate Bar",
        description: "Premium chocolate",
        price: 3.49,
        cost: 1.5,
        quantity: 60,
        category: "groceries",
        barcode: "1234567896",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-008",
        name: "USB Cable",
        description: "USB-C charging cable",
        price: 12.99,
        cost: 5.0,
        quantity: 40,
        category: "electronics",
        barcode: "1234567897",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-009",
        name: "Hand Sanitizer",
        description: "Antibacterial gel",
        price: 4.99,
        cost: 2.0,
        quantity: 8,
        category: "health",
        barcode: "1234567898",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: "PRD-010",
        name: "Energy Drink",
        description: "Caffeine boost drink",
        price: 3.99,
        cost: 1.5,
        quantity: 5,
        category: "beverages",
        barcode: "1234567899",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("products").deleteMany({})
    await db.collection("products").insertMany(products)
    console.log("Products seeded")

    // Seed Users
    const users = [
      {
        userId: "USR-001",
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "System Admin",
        email: "admin@pos.com",
        isActive: true,
        createdAt: new Date(),
      },
      {
        userId: "USR-002",
        username: "cashier1",
        password: "cashier123",
        role: "cashier",
        name: "John Cashier",
        email: "john@pos.com",
        isActive: true,
        createdAt: new Date(),
      },
      {
        userId: "USR-003",
        username: "manager",
        password: "manager123",
        role: "manager",
        name: "Jane Manager",
        email: "jane@pos.com",
        isActive: true,
        createdAt: new Date(),
      },
    ]

    await db.collection("users").deleteMany({})
    await db.collection("users").insertMany(users)
    console.log("Users seeded")

    // Create indexes
    await db.collection("products").createIndex({ productId: 1 }, { unique: true })
    await db.collection("products").createIndex({ barcode: 1 })
    await db.collection("products").createIndex({ category: 1 })
    await db.collection("transactions").createIndex({ transactionId: 1 }, { unique: true })
    await db.collection("transactions").createIndex({ createdAt: -1 })
    await db.collection("users").createIndex({ userId: 1 }, { unique: true })
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    console.log("Indexes created")

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
