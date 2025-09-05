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

export type RegisterInput = z.infer<typeof registerSchema>;
