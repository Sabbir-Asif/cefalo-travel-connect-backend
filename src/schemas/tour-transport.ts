import { z } from "zod";

export const bdPhoneRegex = /^(\+880|880)?1[3-9]\d{8}$/;

export const CreateTourTransportSchema = z.object({
  travelplan_id: z.string().uuid(),
  transport_id: z.string().uuid(),
  departure_time: z.coerce.date(),
  contact_number: z.string().regex(bdPhoneRegex, { message: 'Invalid Bangladeshi phone number' }),
});

export const UpdateTourTransportSchema = z.object({
  departure_time: z.coerce.date().optional(),
  contact_number: z
    .string()
    .regex(bdPhoneRegex, { message: 'Invalid Bangladeshi phone number' })
    .optional(),
});