import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTestimonialSchema, insertPortfolioItemSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

// Admin middleware
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Testimonial routes
  app.get("/api/testimonials", async (_req, res) => {
    const testimonials = await storage.getTestimonials();
    res.json(testimonials);
  });

  app.post("/api/testimonials", isAdmin, async (req, res) => {
    try {
      const testimonial = insertTestimonialSchema.parse(req.body);
      const newTestimonial = await storage.createTestimonial(testimonial);
      res.json(newTestimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.delete("/api/testimonials/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTestimonial(id);
    if (success) {
      res.json({ message: "Testimonial deleted" });
    } else {
      res.status(404).json({ message: "Testimonial not found" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio", async (_req, res) => {
    const items = await storage.getPortfolioItems();
    res.json(items);
  });

  app.post("/api/portfolio", isAdmin, async (req, res) => {
    try {
      const item = insertPortfolioItemSchema.parse(req.body);
      const newItem = await storage.createPortfolioItem(item);
      res.json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid portfolio item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.delete("/api/portfolio/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deletePortfolioItem(id);
    if (success) {
      res.json({ message: "Portfolio item deleted" });
    } else {
      res.status(404).json({ message: "Portfolio item not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}