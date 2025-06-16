import { z } from 'zod';

export const BlogStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const CreateBlogSchema = z.object({
  title: z.string(),
  locationName: z.string(),
  location_points: z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180)
  }),
  description: z.string(),
  cover_image: z.string().optional(),
  status: BlogStatusEnum.optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
});

export const UpdateBlogSchema = z.object({
  title: z.string().optional(),
  locationName: z.string().optional(),
  location_points: z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180)
  }).optional(),
  description: z.string().optional(),
  cover_image: z.string().optional(),
  status: BlogStatusEnum.optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.'
});

