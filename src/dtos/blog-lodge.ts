import { UUID } from "crypto";
import { BlogLodge, CreateBlogLodge } from "../interfaces/blog-lodge";

export class CreateBlogLodgeDto {
  blog_id: UUID;
  lodge_id: UUID;

  constructor(data: CreateBlogLodge) {
    this.blog_id = data.blog_id;
    this.lodge_id = data.lodge_id;
  }
}

export class BlogLodgeDto {
  blog_id: UUID;
  lodge_id: UUID;

  constructor(data: BlogLodge) {
    this.blog_id = data.blog_id;
    this.lodge_id = data.lodge_id;
  }
}