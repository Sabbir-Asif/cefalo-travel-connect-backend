import { z } from 'zod';

export const CreateBlogInsightSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  data: z.string().min(1, 'Data is required'),
});

export const UpdateBlogInsightSchema = z.object({
  label: z.string().optional(),
  data: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});
