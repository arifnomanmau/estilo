import { 
  users, type User, type InsertUser,
  testimonials, type Testimonial, type InsertTestimonial,
  portfolioItems, type PortfolioItem, type InsertPortfolioItem
} from "@shared/schema";

// Add Consultation types here (These need to be defined elsewhere and imported)
type Consultation = {id:number; status: string; createdAt: Date;} & any; // Replace 'any' with actual consultation properties
type InsertConsultation = Omit<Consultation, 'id' | 'status' | 'createdAt'>;


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

  // Consultation operations
  getConsultations(): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultationStatus(id: number, status: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private testimonialMap: Map<number, Testimonial>;
  private portfolioMap: Map<number, PortfolioItem>;
  private currentId: number;
  private testimonialId: number;
  private portfolioId: number;
  private consultationMap: Map<number, Consultation>;
  private consultationId: number;

  constructor() {
    this.users = new Map();
    this.testimonialMap = new Map();
    this.portfolioMap = new Map();
    this.currentId = 1;
    this.testimonialId = 1;
    this.portfolioId = 1;
    this.consultationMap = new Map();
    this.consultationId = 1;
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
    // Make the first user an admin
    const isAdmin = this.users.size === 0 ? true : false;
    const user: User = { ...insertUser, id, isAdmin };
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

  // Consultation methods
  async getConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultationMap.values());
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    return this.consultationMap.get(id);
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const id = this.consultationId++;
    const newConsultation: Consultation = {
      ...consultation,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.consultationMap.set(id, newConsultation);
    return newConsultation;
  }

  async updateConsultationStatus(id: number, status: string): Promise<boolean> {
    const consultation = this.consultationMap.get(id);
    if (!consultation) return false;

    this.consultationMap.set(id, { ...consultation, status });
    return true;
  }
}

export const storage = new MemStorage();