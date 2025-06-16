import { z } from "zod";

export const TransportTypeEnum = z.enum(["BUS", "TRAIN", "FLIGHT", "BOAT", "OTHER"]);

export const CreateTransportSchema = z.object({
  type: TransportTypeEnum,
  name: z.string(),
  starting_location: z.string(),
  starting_point: z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
  }),
  destination: z.string(),
  destination_point: z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
  }),
  departure_time: z.string().datetime().optional().nullable(),
  arrival_time: z.string().datetime().optional().nullable(),
  fare: z.string(),
});
