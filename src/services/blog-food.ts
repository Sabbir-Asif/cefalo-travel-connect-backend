import { UUID } from "crypto";
import { IBlogFoodRepository } from "../repositories/blog-food";
import { blogService } from "../controllers/blog";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { foodService } from "../controllers/food";
import { BlogFoodDto } from "../dtos/blog-food";
import { FoodResponseDto } from "../dtos/food";

export class BlogFoodService {
    constructor(private blogFoodRepository: IBlogFoodRepository) { }

    async createBlogfood(blogId: UUID, foodId: UUID) {
        const existingBlog = await blogService.getBlogById(blogId);
        if (!existingBlog) {
            throw new NotFoundException('Blog not found!', ErrorCode.BLOG_NOT_FOUND);
        }

        const existingFood = await foodService.getFoodById(foodId);
        if (!existingFood) {
            throw new NotFoundException('Food not found!', ErrorCode.FOOD_NOT_FOUND);
        }

        const newBlogFood = await this.blogFoodRepository.create(blogId, foodId);

        return new BlogFoodDto(newBlogFood);
    }

    async deleteBlogFood(blogId: UUID, foodId: UUID): Promise<number> {
        const existingBlog = await blogService.getBlogById(blogId);
        if (!existingBlog) {
            throw new NotFoundException('Blog not found!', ErrorCode.BLOG_NOT_FOUND);
        }

        const existingFood = await foodService.getFoodById(foodId);
        if (!existingFood) {
            throw new NotFoundException('Food not found!', ErrorCode.FOOD_NOT_FOUND);
        }

        const deletedCount =  await this.blogFoodRepository.delete(blogId, foodId);
        if (deletedCount === 0) {
            throw new NotFoundException('Food not found in blog', ErrorCode.FOOD_NOT_FOUND);
        }

        return deletedCount;
    }

    async getFoodsForBlog(blogId: UUID) {
        const existingBlog = await blogService.getBlogById(blogId);
        if (!existingBlog) {
            throw new NotFoundException('Blog not found!', ErrorCode.BLOG_NOT_FOUND);
        }

        const foods = await this.blogFoodRepository.foodsForBlog(blogId);
        return foods.map(food => new FoodResponseDto(food));
    }
}