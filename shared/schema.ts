import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  zipCode: text("zip_code"),
  birthday: text("birthday"),
  referralSource: text("referral_source"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Dress Types table
export const dressTypes = pgTable("dress_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertDressTypeSchema = createInsertSchema(dressTypes).omit({
  id: true,
});

// Measurements table
export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  dressTypeId: integer("dress_type_id").notNull(),
  values: jsonb("values").notNull(), // Store measurements as JSON
  stylePreferences: text("style_preferences"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMeasurementSchema = createInsertSchema(measurements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertDressType = z.infer<typeof insertDressTypeSchema>;
export type DressType = typeof dressTypes.$inferSelect;

export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Measurement = typeof measurements.$inferSelect;

// Extended schema for client with measurements
export const clientWithMeasurementsSchema = z.object({
  client: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    birthday: z.string().optional().nullable(),
    referralSource: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
  }),
  measurements: z.array(
    z.object({
      id: z.number(),
      dressTypeId: z.number(),
      dressTypeName: z.string(),
      values: z.record(z.string(), z.string().or(z.number())),
      stylePreferences: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      createdAt: z.string().or(z.date()),
      updatedAt: z.string().or(z.date()),
    })
  ),
});

export type ClientWithMeasurements = z.infer<typeof clientWithMeasurementsSchema>;
