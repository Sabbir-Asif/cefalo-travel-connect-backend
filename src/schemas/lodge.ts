import { z } from 'zod';
import { LocationPointSchema } from './location';

export const CreateLodgeSchema = z.object({
  name: z.string().min(1, 'Lodge name is required'),
  location_name: z.string().min(1, 'Location name is required'),
  location_point: LocationPointSchema,
  price: z.number().min(0, 'Price can not be less than zero'),
  description: z.string().optional(),
  cover_image: z.string().url('Cover image must be a valid URL').optional(),
});

export const UpdateLodgeSchema = z.object({
  name: z.string().optional(),
  location_name: z.string().optional(),
  location_point: LocationPointSchema.optional(),
  price: z.number().min(0, 'Price can not be less than zero').optional(),
  description: z.string().optional(),
  cover_image: z.string().url('Cover image must be a valid URL').optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});