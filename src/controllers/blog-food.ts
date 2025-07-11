import { UUID } from "crypto";
import { ErrorCode } from "../exceptions/root";
import { UnprocessableEntityException } from "../exceptions/validation";
import { BlogFoodRepository } from "../infrastructure/blog-food-impl";
import { BlogFoodSchema } from "../schemas/blog-foods";
import { BlogFoodService } from "../services/blog-food";
import { Request, Response } from "express";
import { IdSchema } from "../schemas/id";

const blogFoodRepository = new BlogFoodRepository();
let blogFoodService = new BlogFoodService(blogFoodRepository);

export const __setBlogService = (svc: BlogFoodService) => { blogFoodService = svc; }

export const createBlogFood = async (req: Request, res: Response) => {
    const parsed = BlogFoodSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const { blog_id, food_id } = parsed.data;
    const result = await blogFoodService.createBlogfood(blog_id as UUID, food_id as UUID);

   res.status(201).json(result);
}

export const deleteBlogFood = async (req: Request, res: Response) => {
    const blogId = IdSchema.safeParse(req.params.blogId);
    const foodId = IdSchema.safeParse(req.params.foodId);
    if (!blogId.success) {
        throw new UnprocessableEntityException(blogId.error, "Invalid blog ID", ErrorCode.INVALID_BLOG_ID);
    }
    if (!foodId.success) {
        throw new UnprocessableEntityException(foodId.error, "Invalid food ID", ErrorCode.INVALID_FOOD_ID);
    }

    const deletedCount = await blogFoodService.deleteBlogFood(blogId.data as UUID, foodId.data as UUID);

    res.status(204).json({ deletedCount });
};

export const getFoodsForBlog = async (req: Request, res: Response) => {
    const parsedId = IdSchema.safeParse(req.params.id);
    if (!parsedId.success) {
        throw new UnprocessableEntityException(parsedId.error, "Invalid blog ID", ErrorCode.INVALID_BLOG_ID);
    }

    const foods = await blogFoodService.getFoodsForBlog(parsedId.data as UUID);

    res.status(200).json(foods);
}