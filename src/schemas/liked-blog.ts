import { z } from "zod";

export const LikedBlogSchema = z.object({
    blog_id: z.string().uuid(),
    reaction_name: z.enum(['inspired', 'amazed', 'useful', 'curious']),
});

export const UpdateLikedBlogSchema = z.object({
    reaction_name: z.enum(['inspired', 'amazed', 'useful', 'curious']),
})