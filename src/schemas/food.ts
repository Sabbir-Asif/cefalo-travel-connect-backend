import { z } from 'zod';

export const CreateFoodSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  category: z.string().min(1, 'Category is required'),
  provider: z.string().min(1, 'Provider is required'),
  location: z.string().min(1, 'Location is required'),
});

export const UpdateFoodSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  provider: z.string().optional(),
  location: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});
