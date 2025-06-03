import { z } from 'zod';

export const BlogStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const CreateBlogSchema = z.object({
  title: z.string(),
  userId: z.number(),
  locationName: z.string(),
  locationPoints: z.object({
    lat: z.number(),
    long: z.number()
  }),
  description: z.string(),
  cover_image: z.string().optional(),
  status: BlogStatusEnum.optional(),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  videos: z.array(z.string()).optional().default([]),
});

