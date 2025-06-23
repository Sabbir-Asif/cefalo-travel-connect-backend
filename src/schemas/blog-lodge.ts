import { z } from "zod";

export const BlogLodgeSchema = z.object({
  blog_id: z.string().uuid(),
  lodge_id: z.string().uuid()
});