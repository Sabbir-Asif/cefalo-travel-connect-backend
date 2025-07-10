import { z } from "zod";
import { BlogReaction } from "../interfaces/liked-blog";

export const LikedBlogSchema = z.object({
  blog_id: z.string().uuid(),
  reaction_name: z.nativeEnum(BlogReaction),
});

export const UpdateLikedBlogSchema = z.object({
  reaction_name: z.nativeEnum(BlogReaction),
});