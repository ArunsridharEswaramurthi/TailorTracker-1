import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  dressTypes, type DressType, type InsertDressType,
  measurements, type Measurement, type InsertMeasurement,
  type ClientWithMeasurements
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.SessionStore;

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
  sessionStore: session.SessionStore;
  
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

export const storage = new MemStorage();
