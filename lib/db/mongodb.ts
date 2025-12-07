// Database Layer - Singleton Pattern for MongoDB Connection
// Reengineered from file-based storage in original Java system

import { MongoClient, type Db, type Collection } from "mongodb"

// Singleton Pattern - ensures only one database connection
class DatabaseConnection {
  private static instance: DatabaseConnection
  private client: MongoClient | null = null
  private db: Db | null = null

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  async connect(): Promise<Db> {
    if (this.db) return this.db

    const uri =
      process.env.MONGODB_URI ||
      "mongodb+srv://i222657:goku1356@a3p2.p7u3y.mongodb.net/?retryWrites=true&w=majority&appName=a3p2"

    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    this.client = new MongoClient(uri)
    await this.client.connect()
    this.db = this.client.db("pos_system")
    console.log("Connected to MongoDB Atlas")
    return this.db
  }

  async getCollection<T extends Document>(name: string): Promise<Collection<T>> {
    const db = await this.connect()
    return db.collection<T>(name)
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }
}

export const database = DatabaseConnection.getInstance()
export default database
