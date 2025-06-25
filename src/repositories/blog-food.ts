import { UUID } from "crypto";
import { BlogFood } from "../interfaces/blog-foods";
import { Food } from "../interfaces/food";

export interface IBlogFoodRepository {
    create(blogId: UUID, lodgeId: UUID): Promise<BlogFood>
    delete(blogId: UUID, foodId: UUID): Promise<number>;
    foodsForBlog(blogId: UUID): Promise<Food[]>;
}