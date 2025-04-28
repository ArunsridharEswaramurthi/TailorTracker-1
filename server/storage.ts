import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  dressTypes, type DressType, type InsertDressType,
  measurements, type Measurement, type InsertMeasurement,
  type ClientWithMeasurements
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: any; // Using any to avoid session.SessionStore type issues

  // Clients
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientWithMeasurements(id: number): Promise<ClientWithMeasurements | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: InsertClient): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Dress Types
  getAllDressTypes(): Promise<DressType[]>;
  getDressType(id: number): Promise<DressType | undefined>;
  createDressType(dressType: InsertDressType): Promise<DressType>;
  updateDressType(id: number, dressType: InsertDressType): Promise<DressType | undefined>;
  deleteDressType(id: number): Promise<boolean>;

  // Measurements
  getMeasurement(id: number): Promise<Measurement | undefined>;
  getMeasurementsByClientId(clientId: number): Promise<Measurement[]>;
  createMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
  updateMeasurement(id: number, measurement: InsertMeasurement): Promise<Measurement | undefined>;
  deleteMeasurement(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private dressTypes: Map<number, DressType>;
  private measurements: Map<number, Measurement>;
  sessionStore: any;
  
  private userIdCounter: number;
  private clientIdCounter: number;
  private dressTypeIdCounter: number;
  private measurementIdCounter: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.dressTypes = new Map();
    this.measurements = new Map();
    
    this.userIdCounter = 1;
    this.clientIdCounter = 1;
    this.dressTypeIdCounter = 1;
    this.measurementIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Pre-populate with default dress types
    this.createDressType({ name: "Formal Shirt", description: "Standard formal shirt measurements" });
    this.createDressType({ name: "Trousers", description: "Standard trousers measurements" });
    this.createDressType({ name: "Suit Jacket", description: "Standard suit jacket measurements" });
    this.createDressType({ name: "Traditional Wear", description: "Traditional clothing measurements" });
  }

  // Auth methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientWithMeasurements(id: number): Promise<ClientWithMeasurements | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const clientMeasurements = Array.from(this.measurements.values())
      .filter(m => m.clientId === id)
      .map(m => {
        const dressType = this.dressTypes.get(m.dressTypeId);
        return {
          ...m,
          dressTypeName: dressType?.name || "Unknown",
        };
      });

    return {
      client,
      measurements: clientMeasurements,
    };
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const now = new Date();
    const client: Client = {
      ...insertClient,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateClient: InsertClient): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient: Client = {
      ...client,
      ...updateClient,
      id,
      updatedAt: new Date(),
    };

    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    if (!this.clients.has(id)) return false;
    
    // Delete associated measurements
    const clientMeasurements = Array.from(this.measurements.values())
      .filter(m => m.clientId === id);
    
    for (const measurement of clientMeasurements) {
      this.measurements.delete(measurement.id);
    }
    
    return this.clients.delete(id);
  }

  // Dress Type methods
  async getAllDressTypes(): Promise<DressType[]> {
    return Array.from(this.dressTypes.values());
  }

  async getDressType(id: number): Promise<DressType | undefined> {
    return this.dressTypes.get(id);
  }

  async createDressType(insertDressType: InsertDressType): Promise<DressType> {
    const id = this.dressTypeIdCounter++;
    const dressType: DressType = { ...insertDressType, id };
    this.dressTypes.set(id, dressType);
    return dressType;
  }

  async updateDressType(id: number, updateDressType: InsertDressType): Promise<DressType | undefined> {
    const dressType = this.dressTypes.get(id);
    if (!dressType) return undefined;

    const updatedDressType: DressType = {
      ...dressType,
      ...updateDressType,
      id,
    };

    this.dressTypes.set(id, updatedDressType);
    return updatedDressType;
  }

  async deleteDressType(id: number): Promise<boolean> {
    return this.dressTypes.delete(id);
  }

  // Measurement methods
  async getMeasurement(id: number): Promise<Measurement | undefined> {
    return this.measurements.get(id);
  }

  async getMeasurementsByClientId(clientId: number): Promise<Measurement[]> {
    return Array.from(this.measurements.values())
      .filter(measurement => measurement.clientId === clientId);
  }

  async createMeasurement(insertMeasurement: InsertMeasurement): Promise<Measurement> {
    const id = this.measurementIdCounter++;
    const now = new Date();
    const measurement: Measurement = {
      ...insertMeasurement,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.measurements.set(id, measurement);
    return measurement;
  }

  async updateMeasurement(id: number, updateMeasurement: InsertMeasurement): Promise<Measurement | undefined> {
    const measurement = this.measurements.get(id);
    if (!measurement) return undefined;

    const updatedMeasurement: Measurement = {
      ...measurement,
      ...updateMeasurement,
      id,
      updatedAt: new Date(),
    };

    this.measurements.set(id, updatedMeasurement);
    return updatedMeasurement;
  }

  async deleteMeasurement(id: number): Promise<boolean> {
    return this.measurements.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true
    });
  }

  // Auth methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Client methods
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientWithMeasurements(id: number): Promise<ClientWithMeasurements | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    if (!client) return undefined;

    // First retrieve the measurements
    const measurementRows = await db.select().from(measurements).where(eq(measurements.clientId, id));
    
    // Then get the dress types for those measurements
    const measurementsWithDressTypes = await Promise.all(
      measurementRows.map(async (m) => {
        const [dressType] = await db.select().from(dressTypes).where(eq(dressTypes.id, m.dressTypeId));
        return {
          ...m,
          dressTypeName: dressType?.name || "Unknown",
        };
      })
    );

    return {
      client,
      measurements: measurementsWithDressTypes,
    };
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    // Handle nullable fields
    const clientWithNullableFields = {
      ...insertClient,
      email: insertClient.email || null,
      phone: insertClient.phone || null,
      address: insertClient.address || null,
      city: insertClient.city || null,
      zipCode: insertClient.zipCode || null,
      birthday: insertClient.birthday || null,
      referralSource: insertClient.referralSource || null,
      notes: insertClient.notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [client] = await db.insert(clients).values(clientWithNullableFields).returning();
    return client;
  }

  async updateClient(id: number, updateClient: InsertClient): Promise<Client | undefined> {
    const [existingClient] = await db.select().from(clients).where(eq(clients.id, id));
    if (!existingClient) return undefined;

    // Handle nullable fields
    const clientWithNullableFields = {
      ...updateClient,
      email: updateClient.email || null,
      phone: updateClient.phone || null,
      address: updateClient.address || null,
      city: updateClient.city || null,
      zipCode: updateClient.zipCode || null,
      birthday: updateClient.birthday || null,
      referralSource: updateClient.referralSource || null,
      notes: updateClient.notes || null,
      updatedAt: new Date()
    };

    const [updatedClient] = await db
      .update(clients)
      .set(clientWithNullableFields)
      .where(eq(clients.id, id))
      .returning();

    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    // Delete associated measurements first
    await db.delete(measurements).where(eq(measurements.clientId, id));
    
    // Delete the client
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  // Dress Type methods
  async getAllDressTypes(): Promise<DressType[]> {
    return await db.select().from(dressTypes);
  }

  async getDressType(id: number): Promise<DressType | undefined> {
    const [dressType] = await db.select().from(dressTypes).where(eq(dressTypes.id, id));
    return dressType;
  }

  async createDressType(insertDressType: InsertDressType): Promise<DressType> {
    // Handle nullable fields
    const dressTypeWithNullableFields = {
      ...insertDressType,
      description: insertDressType.description || null
    };
    
    const [dressType] = await db.insert(dressTypes).values(dressTypeWithNullableFields).returning();
    return dressType;
  }

  async updateDressType(id: number, updateDressType: InsertDressType): Promise<DressType | undefined> {
    const [existingDressType] = await db.select().from(dressTypes).where(eq(dressTypes.id, id));
    if (!existingDressType) return undefined;

    // Handle nullable fields
    const dressTypeWithNullableFields = {
      ...updateDressType,
      description: updateDressType.description || null
    };

    const [updatedDressType] = await db
      .update(dressTypes)
      .set(dressTypeWithNullableFields)
      .where(eq(dressTypes.id, id))
      .returning();

    return updatedDressType;
  }

  async deleteDressType(id: number): Promise<boolean> {
    const result = await db.delete(dressTypes).where(eq(dressTypes.id, id)).returning();
    return result.length > 0;
  }

  // Measurement methods
  async getMeasurement(id: number): Promise<Measurement | undefined> {
    const [measurement] = await db.select().from(measurements).where(eq(measurements.id, id));
    return measurement;
  }

  async getMeasurementsByClientId(clientId: number): Promise<Measurement[]> {
    return await db.select().from(measurements).where(eq(measurements.clientId, clientId));
  }

  async createMeasurement(insertMeasurement: InsertMeasurement): Promise<Measurement> {
    // Handle nullable fields
    const measurementWithNullableFields = {
      ...insertMeasurement,
      notes: insertMeasurement.notes || null,
      stylePreferences: insertMeasurement.stylePreferences || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [measurement] = await db.insert(measurements).values(measurementWithNullableFields).returning();
    return measurement;
  }

  async updateMeasurement(id: number, updateMeasurement: InsertMeasurement): Promise<Measurement | undefined> {
    const [existingMeasurement] = await db.select().from(measurements).where(eq(measurements.id, id));
    if (!existingMeasurement) return undefined;

    // Handle nullable fields
    const measurementWithNullableFields = {
      ...updateMeasurement,
      notes: updateMeasurement.notes || null,
      stylePreferences: updateMeasurement.stylePreferences || null,
      updatedAt: new Date()
    };

    const [updatedMeasurement] = await db
      .update(measurements)
      .set(measurementWithNullableFields)
      .where(eq(measurements.id, id))
      .returning();

    return updatedMeasurement;
  }

  async deleteMeasurement(id: number): Promise<boolean> {
    const result = await db.delete(measurements).where(eq(measurements.id, id)).returning();
    return result.length > 0;
  }
}

// Switch from memory storage to database storage
export const storage = new DatabaseStorage();
