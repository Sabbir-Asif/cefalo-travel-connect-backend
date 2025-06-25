import { z } from "zod";

export const CreateTourTransportSchema = z.object({
  travelplan_id: z.string().uuid(),
  transport_id: z.string().uuid(),
  departure_time: z.coerce.date(),
  contact_number: z.string().min(6).max(20),
});

export const UpdateTourTransportSchema = z.object({
  departure_time: z.coerce.date().optional(),
  contact_number: z.string().min(6).max(20).optional(),
});
