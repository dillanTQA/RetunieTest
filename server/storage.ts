import { 
  users, triageRequests, specifications, suppliers,
  type User, type InsertUser,
  type TriageRequest, type InsertTriageRequest,
  type Specification, type InsertSpecification,
  type Supplier, type Recommendation
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth (delegated or re-implemented if simple)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Triage
  createTriageRequest(req: InsertTriageRequest): Promise<TriageRequest>;
  getTriageRequest(id: number): Promise<TriageRequest | undefined>;
  getUserTriageRequests(userId: string): Promise<TriageRequest[]>;
  updateTriageRequest(id: number, updates: Partial<TriageRequest>): Promise<TriageRequest>;

  // Specs
  getSpecification(triageRequestId: number): Promise<Specification | undefined>;
  createSpecification(spec: InsertSpecification): Promise<Specification>;
  updateSpecification(id: number, content: string): Promise<Specification>;

  // Suppliers
  getSuppliers(category?: string): Promise<Supplier[]>;
  seedSuppliers(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // === Auth ===
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // We mainly use Replit Auth, but this supports the interface
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // === Triage ===
  async createTriageRequest(req: InsertTriageRequest): Promise<TriageRequest> {
    const [triage] = await db.insert(triageRequests).values(req).returning();
    return triage;
  }

  async getTriageRequest(id: number): Promise<TriageRequest | undefined> {
    const [triage] = await db.select().from(triageRequests).where(eq(triageRequests.id, id));
    return triage;
  }

  async getUserTriageRequests(userId: string): Promise<TriageRequest[]> {
    return db.select()
      .from(triageRequests)
      .where(eq(triageRequests.userId, userId))
      .orderBy(desc(triageRequests.createdAt));
  }

  async updateTriageRequest(id: number, updates: Partial<TriageRequest>): Promise<TriageRequest> {
    const [updated] = await db
      .update(triageRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(triageRequests.id, id))
      .returning();
    return updated;
  }

  // === Specs ===
  async getSpecification(triageRequestId: number): Promise<Specification | undefined> {
    const [spec] = await db.select().from(specifications).where(eq(specifications.triageRequestId, triageRequestId));
    return spec;
  }

  async createSpecification(spec: InsertSpecification): Promise<Specification> {
    const [newSpec] = await db.insert(specifications).values(spec).returning();
    return newSpec;
  }

  async updateSpecification(id: number, content: string): Promise<Specification> {
    const [updated] = await db
      .update(specifications)
      .set({ content })
      .where(eq(specifications.id, id))
      .returning();
    return updated;
  }

  // === Suppliers ===
  async getSuppliers(category?: string): Promise<Supplier[]> {
    let query = db.select().from(suppliers);
    if (category) {
      // @ts-ignore - complex type inference with where/dynamic
      return query.where(eq(suppliers.category, category));
    }
    return query;
  }

  async seedSuppliers(): Promise<void> {
    const count = await db.select({ count: suppliers.id }).from(suppliers);
    if (count.length === 0) {
      await db.insert(suppliers).values([
        { name: "TechFlow Solutions", category: "sow", description: "Expertise in digital transformation and software delivery.", rating: 5, isPreferred: true },
        { name: "Global Staffing Co", category: "agency", description: "Large scale temporary labor provider.", rating: 4, isPreferred: true },
        { name: "Independent Experts", category: "independent", description: "Platform for vetting independent contractors.", rating: 5, isPreferred: false },
        { name: "CyberSec Partners", category: "sow", description: "Specialized security audits and implementation.", rating: 5, isPreferred: true },
        { name: "Admin Assist", category: "agency", description: "Office support and administration staff.", rating: 4, isPreferred: true },
      ]);
    }
  }
}

export const storage = new DatabaseStorage();
