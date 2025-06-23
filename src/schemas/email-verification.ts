import { z } from "zod";

export const InitiateVerificationSchema = z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1)
  });