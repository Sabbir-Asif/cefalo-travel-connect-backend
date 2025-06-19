import { z } from "zod";

export const BlogTransportSchema = z.object({
  blog_id: z.string().uuid(),
  transport_id: z.string().uuid()
});
