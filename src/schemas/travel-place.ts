import { z } from 'zod';
import { LocationPointSchema } from './location';

export const CreateTravelPlaceSchema = z.object({
  name: z.string().min(1, 'Place name is required'),
  location_name: z.string().min(1, 'Location name is required'),
  location_point: LocationPointSchema,
  cover_image: z.string().url('Cover image must be a valid URL').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateTravelPlaceSchema = z.object({
  name: z.string().optional(),
  location_name: z.string().optional(),
  location_point: LocationPointSchema.optional(),
  cover_image: z.string().url('Cover image must be a valid URL').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});
