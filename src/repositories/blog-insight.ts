import { UUID } from "crypto";
import { BlogInsight, CreateBlogInsight, UpdateBlogInsight } from "../interfaces/blog-insight";

export interface IBlogInsightRepository {
  create(userId: UUID, blogId: UUID, insight: CreateBlogInsight): Promise<BlogInsight>;
  getAll(): Promise<BlogInsight[]>;
  getByBlogId(blogId: UUID): Promise<BlogInsight[]>
  getById(id: UUID): Promise<BlogInsight | null>;
  update(id: UUID, data: UpdateBlogInsight): Promise<BlogInsight>;
  delete(id: UUID): Promise<void>;
  search(params: Record<string, any>): Promise<BlogInsight[]>;
}
