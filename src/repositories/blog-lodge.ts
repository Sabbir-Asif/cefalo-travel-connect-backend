import { UUID } from "crypto";
import { BlogLodge } from "../interfaces/blog-lodge";
import { Lodge } from "../interfaces/lodge";

export interface IBlogLodgeRepository {
  create(blogId: UUID, lodgeId: UUID): Promise<BlogLodge>;
  delete(blogId: UUID, lodgeId: UUID): Promise<number>;
  lodgesForBlog(blogId: UUID): Promise<Lodge[]>;
}