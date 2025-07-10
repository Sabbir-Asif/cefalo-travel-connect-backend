import { z } from "zod";

export const LocationPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180),
});