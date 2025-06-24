import { z } from "zod";

export const TourLodgeSchema = z.object({
  travelplan_id: z.string().uuid(),
  lodge_id: z.string().uuid()
});