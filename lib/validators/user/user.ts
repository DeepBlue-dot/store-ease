// lib/validators/user.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  phone: z.string().min(6).max(32).optional(),
  address: z.string().max(255).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  address: z.string().max(255).optional(),
});

export const userquerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Number(val))
    .default(10),
  search: z.string().optional(),
  role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  emailVerified: z.enum(["true", "false"]).optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  select: z
    .string()
    .optional()
    .transform((val) => val?.split(",").map((f) => f.trim())),
  sortBy: z
    .enum(["name", "email", "createdAt", "updatedAt", "role", "status"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
