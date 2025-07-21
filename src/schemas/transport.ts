import { z } from "zod";
import { LocationPointSchema } from "./location";

export const TransportTypeEnum = z.enum(['BUS', 'TRAIN', 'FLIGHT', 'BOAT', 'OTHER']);

export const CreateTransportSchema = z.object({
  type: TransportTypeEnum,
  name: z.string(),
  starting_location: z.string(),
  starting_point: LocationPointSchema,
  destination: z.string(),
  destination_point: LocationPointSchema,
  departure_time: z.string().datetime().optional().nullable(),
  arrival_time: z.string().datetime().optional().nullable(),
  fare: z.string(),
});

export const UpdateTransportSchema = z.object({
  type: TransportTypeEnum.optional(),
  name: z.string().optional(),
  starting_location: z.string().optional(),
  starting_point: LocationPointSchema.optional(),
  destination: z.string().optional(),
  destination_point: LocationPointSchema.optional(),
  departure_time: z.string().datetime().optional().nullable(),
  arrival_time: z.string().datetime().optional().nullable(),
  fare: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.'
});
