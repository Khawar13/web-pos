// Repository Pattern - Base Repository Interface
// Provides abstraction over data access operations

import type { Collection, Filter, OptionalUnlessRequiredId, UpdateFilter } from "mongodb"
import database from "../db/mongodb"

export interface IRepository<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  findOne(filter: Filter<T>): Promise<T | null>
  find(filter: Filter<T>): Promise<T[]>
  create(item: T): Promise<T>
  update(id: string, item: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
}

export abstract class BaseRepository<T extends Document> implements IRepository<T> {
  protected collectionName: string
  protected idField: string

  constructor(collectionName: string, idField = "_id") {
    this.collectionName = collectionName
    this.idField = idField
  }

  protected async getCollection(): Promise<Collection<T>> {
    return database.getCollection<T>(this.collectionName)
  }

  async findAll(): Promise<T[]> {
    const collection = await this.getCollection()
    return collection.find({}).toArray() as Promise<T[]>
  }

  async findById(id: string): Promise<T | null> {
    const collection = await this.getCollection()
    const filter = { [this.idField]: id } as Filter<T>
    return collection.findOne(filter) as Promise<T | null>
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    const collection = await this.getCollection()
    return collection.findOne(filter) as Promise<T | null>
  }

  async find(filter: Filter<T>): Promise<T[]> {
    const collection = await this.getCollection()
    return collection.find(filter).toArray() as Promise<T[]>
  }

  async create(item: T): Promise<T> {
    const collection = await this.getCollection()
    const result = await collection.insertOne(item as OptionalUnlessRequiredId<T>)
    return { ...item, _id: result.insertedId } as T
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    const collection = await this.getCollection()
    const filter = { [this.idField]: id } as Filter<T>
    const update = { $set: { ...item, updatedAt: new Date() } } as UpdateFilter<T>
    await collection.updateOne(filter, update)
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const filter = { [this.idField]: id } as Filter<T>
    const result = await collection.deleteOne(filter)
    return result.deletedCount > 0
  }
}
