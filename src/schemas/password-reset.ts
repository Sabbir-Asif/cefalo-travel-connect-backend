import { z } from "zod";

export const InitiatePasswordResetSchema = z.object({
  email: z.string().email("A valid email is required"),
});

export const CompletePasswordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
