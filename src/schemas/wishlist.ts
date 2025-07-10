import { z } from 'zod';
import { LocationPointSchema } from './location';

export const WishlistStatusEnum = z.enum(['PUBLIC', 'PRIVATE']);


export const CreateWishlistSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  location_name: z.string().min(1, 'Location name is required'),
  location_point: LocationPointSchema,
  travel_date: z.coerce.date({ invalid_type_error: 'Travel date must be a valid datetime' }),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  blog_id: z.string().uuid().optional(),
  travel_place_id: z.string().uuid().optional(),
  cover_image: z.string().url('Cover image must be a valid URL').optional(),
  status: WishlistStatusEnum.optional()
});

export const UpdateWishlistSchema = z.object({
  title: z.string().optional(),
  location_name: z.string().optional(),
  location_point: LocationPointSchema.optional(),
  travel_date: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  blog_id: z.string().uuid().nullable().optional(),
  travel_place_id: z.string().uuid().nullable().optional(),
  cover_image: z.string().url().optional(),
  status: WishlistStatusEnum.optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});
