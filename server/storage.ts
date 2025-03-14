import { 
  users, type User, type InsertUser,
  testimonials, type Testimonial, type InsertTestimonial,
  portfolioItems, type PortfolioItem, type InsertPortfolioItem
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Testimonial operations
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<boolean>;

  // Portfolio operations
  getPortfolioItems(): Promise<PortfolioItem[]>;
  getPortfolioItem(id: number): Promise<PortfolioItem | undefined>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  deletePortfolioItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private testimonialMap: Map<number, Testimonial>;
  private portfolioMap: Map<number, PortfolioItem>;
  private currentId: number;
  private testimonialId: number;
  private portfolioId: number;

  constructor() {
    this.users = new Map();
    this.testimonialMap = new Map();
    this.portfolioMap = new Map();
    this.currentId = 1;
    this.testimonialId = 1;
    this.portfolioId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonialMap.values());
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonialMap.get(id);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const newTestimonial: Testimonial = {
      ...testimonial,
      id,
      createdAt: new Date(),
    };
    this.testimonialMap.set(id, newTestimonial);
    return newTestimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonialMap.delete(id);
  }

  // Portfolio methods
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioMap.values());
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    return this.portfolioMap.get(id);
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.portfolioId++;
    const newItem: PortfolioItem = {
      ...item,
      id,
      createdAt: new Date(),
    };
    this.portfolioMap.set(id, newItem);
    return newItem;
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    return this.portfolioMap.delete(id);
  }
}

export const storage = new MemStorage();