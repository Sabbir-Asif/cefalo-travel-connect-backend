import { z } from 'zod';

export const TravelPlanStatusEnum = z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']);

const LocationPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180),
});

export const CreateTravelPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  starting_point_name: z.string().min(1, 'Starting point name is required'),
  starting_point_location: LocationPointSchema,
  destination_name: z.string().min(1, 'Destination name is required'),
  destination_location: LocationPointSchema,
  starting_date: z.coerce.date({ invalid_type_error: 'Starting date must be a valid date' }),
  ending_date: z.coerce.date({ invalid_type_error: 'Ending date must be a valid date' }),
  budget: z.number().min(0, 'Budget must be a positive number'),
  description: z.string().min(1, 'Description is required'),
  status: TravelPlanStatusEnum.optional(),
});

export const UpdateTravelPlanSchema = z.object({
  title: z.string().optional(),
  starting_point_name: z.string().optional(),
  starting_point_location: LocationPointSchema.optional(),
  destination_name: z.string().optional(),
  destination_location: LocationPointSchema.optional(),
  starting_date: z.coerce.date().optional(),
  ending_date: z.coerce.date().optional(),
  budget: z.number().min(0).optional(),
  description: z.string().optional(),
  status: TravelPlanStatusEnum.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update.',
});
