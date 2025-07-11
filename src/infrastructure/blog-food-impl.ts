import { UUID } from 'crypto';
import { BlogFood } from '../interfaces/blog-foods';
import { IBlogFoodRepository } from '../repositories/blog-food';
import { db } from '../configs/db';
import { Food } from '../interfaces/food';
export class BlogFoodRepository implements IBlogFoodRepository {
    private tableName = 'blog_foods';

    async create(blogId: UUID, lodgeId: UUID): Promise<BlogFood> {
        const [newBlogFood] = await db(this.tableName)
        .insert({ blog_id: blogId, food_id: lodgeId })
        .returning("*");

        return {
            blog_id: newBlogFood.blog_id,
            food_id: newBlogFood.food_id
        }
    }

    async delete(blogId: UUID, foodId: UUID): Promise<number> {
        return await db(this.tableName)
            .where({ blog_id: blogId, food_id: foodId })
            .del();
    }

    async foodsForBlog(blogId: UUID): Promise<Food[]> {
        const foods = await db(this.tableName)
        .join('foods', 'blog_foods.food_id', 'foods.id')
        .where('blog_foods.blog_id', blogId)
        .select('foods.*');

        return foods.map(food => ({
            ...food,
            created_at: new Date(food.created_at),
            updated_at: new Date(food.updated_at)
        }));
    }
}