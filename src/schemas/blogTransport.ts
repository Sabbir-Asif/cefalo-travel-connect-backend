import { z } from "zod";

export const BlogTransportSchema = z.object({
  blogId: z.string().uuid(),
  transportId: z.string().uuid()
});
