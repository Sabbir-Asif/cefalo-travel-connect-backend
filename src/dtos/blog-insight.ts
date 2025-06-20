import { UUID } from "crypto";
import { BlogInsight, CreateBlogInsight, UpdateBlogInsight } from "../interfaces/blog-insight";

export class CreateBlogInsightDto {
  label: string;
  data: string;

  constructor(data: CreateBlogInsight) {
    this.label = data.label;
    this.data = data.data;
  }
}

export class UpdateBlogInsightDto {
  label?: string;
  data?: string;

  constructor(data: UpdateBlogInsight) {
    this.label = data.label;
    this.data = data.data;
  }
}

export class BlogInsightResponseDto {
  id: UUID;
  blog_id: UUID;
  user_id: UUID
  label: string;
  data: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: BlogInsight) {
    this.id = data.id;
    this.blog_id = data.blog_id;
    this.user_id = data.user_id;
    this.label = data.label;
    this.data = data.data;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
