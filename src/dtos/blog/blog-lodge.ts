import { UUID } from "crypto";
import { BlogLodge } from "../../interfaces/blog-lodge";

export class BlogLodgeDto {
  blog_id: UUID;
  lodge_id: UUID;

  constructor(data: BlogLodge) {
    this.blog_id = data.blog_id;
    this.lodge_id = data.lodge_id;
  }
}