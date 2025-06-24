import { z } from "zod";

export const TourMemberSchema = z.object({
    travelplan_id: z.string().uuid(),
    user_id: z.string().uuid()
});
