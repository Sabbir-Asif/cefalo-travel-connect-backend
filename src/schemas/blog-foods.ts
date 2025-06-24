import { z } from 'zod';

export const BlogFoodSchema = z.object({
    blog_id: z.string().uuid(),
    food_id: z.string().uuid(),
});