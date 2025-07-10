import { UUID } from "crypto";
import { BlogFood } from "../../interfaces/blog-foods";

export class BlogFoodDto {
  blog_id: UUID;
  food_id: UUID;

  constructor(data : BlogFood
  ) {
    this.blog_id = data.blog_id;
    this.food_id = data.food_id;
  }
}