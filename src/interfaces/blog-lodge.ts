import { UUID } from "crypto";

export interface BlogLodge {
  blog_id: UUID;
  lodge_id: UUID;
}

export interface CreateBlogLodge {
  blog_id: UUID;
  lodge_id: UUID;
}