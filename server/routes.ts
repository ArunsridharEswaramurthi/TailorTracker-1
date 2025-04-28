import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertClientSchema, insertDressTypeSchema, insertMeasurementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Clients routes
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClientWithMeasurements(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.updateClient(parseInt(req.params.id), validatedData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteClient(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Dress Types routes
  app.get("/api/dress-types", requireAuth, async (req, res) => {
    try {
      const dressTypes = await storage.getAllDressTypes();
      res.json(dressTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dress types" });
    }
  });

  app.post("/api/dress-types", requireAuth, async (req, res) => {
    try {
      const validatedData = insertDressTypeSchema.parse(req.body);
      const dressType = await storage.createDressType(validatedData);
      res.status(201).json(dressType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dress type data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dress type" });
    }
  });

  // Measurements routes
  app.get("/api/clients/:clientId/measurements", requireAuth, async (req, res) => {
    try {
      const measurements = await storage.getMeasurementsByClientId(parseInt(req.params.clientId));
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch measurements" });
    }
  });

  app.post("/api/measurements", requireAuth, async (req, res) => {
    try {
      const validatedData = insertMeasurementSchema.parse(req.body);
      const measurement = await storage.createMeasurement(validatedData);
      res.status(201).json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid measurement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create measurement" });
    }
  });

  app.put("/api/measurements/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertMeasurementSchema.parse(req.body);
      const measurement = await storage.updateMeasurement(parseInt(req.params.id), validatedData);
      if (!measurement) {
        return res.status(404).json({ message: "Measurement not found" });
      }
      res.json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid measurement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update measurement" });
    }
  });

  app.delete("/api/measurements/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteMeasurement(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete measurement" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
