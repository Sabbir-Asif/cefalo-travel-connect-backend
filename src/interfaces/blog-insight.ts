import { UUID } from "crypto";
import { UserResponse } from "./user";

export interface BlogInsight {
  id: UUID;
  blog_id: UUID;
  user_id: UUID;
  label: string;
  data: string;
  created_at: Date;
  updated_at: Date;
}

export interface BlogInsightResponse {
  id: UUID;
  blog_id: UUID;
  user_id: UUID;
  user: UserResponse;
  label: string;
  data: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBlogInsight {
  label: string;
  data: string;
}

export interface UpdateBlogInsight {
  label?: string;
  data?: string;
}
