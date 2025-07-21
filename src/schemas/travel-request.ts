import { z } from 'zod';

export const TravelRequestStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);

export const CreateTravelRequestSchema = z.object({
  travel_plan_id: z.string().uuid({ message: 'Invalid travel plan ID format' }),
  user_to: z.string().uuid({ message: 'Invalid recipient user ID format' }),
  title: z.string().min(1, 'Title is required'),
  message: z.string().optional(),
});

export const UpdateTravelRequestSchema = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  status: TravelRequestStatusEnum.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});
