import { z } from 'zod';

export const BlogStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const CreateBlogSchema = z.object({
  title: z.string(),
  locationName: z.string(),
  location_points: z.object({
    lat: z.number(),
    long: z.number()
  }),
  description: z.string(),
  cover_image: z.string().optional(),
  status: BlogStatusEnum.optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
});

