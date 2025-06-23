import { z } from "zod";

export const CreateDiscussionSchema = z.object({
  travel_plan_id: z.string().uuid(),
  content: z.string().min(1, "Content is required"),
});
