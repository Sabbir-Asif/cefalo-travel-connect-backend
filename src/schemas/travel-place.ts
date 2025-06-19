import { z } from 'zod';

export const CreateTravelPlaceSchema = z.object({
  name: z.string().min(1, 'Place name is required'),
  location_name: z.string().min(1, 'Location name is required'),
  location_point: z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
  }),
  cover_image: z.string().url('Cover image must be a valid URL').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateTravelPlaceSchema = z.object({
  name: z.string().optional(),
  location_name: z.string().optional(),
  location_point: z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
  }).optional(),
  cover_image: z.string().url('Cover image must be a valid URL').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});
