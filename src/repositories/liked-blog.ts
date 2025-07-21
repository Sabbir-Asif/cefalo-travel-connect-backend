import { UUID } from "crypto";
import { User } from "../interfaces/user";
import { Blog } from "../interfaces/blog";
import { LikedBlog, LikedBlogResponse } from "../interfaces/liked-blog";


export interface ILikedBlogRepository {
    create(data: LikedBlog): Promise<LikedBlogResponse>;
    delete(userId: UUID, blogId: UUID): Promise<number>;
    update(data: LikedBlog): Promise<LikedBlogResponse>;
    findByUserAndBlog(userId: UUID, blogId: UUID): Promise<LikedBlogResponse>;
    usersForBlog(blogId: UUID): Promise<User[]>;
    blogsForUser(userId: UUID): Promise<Blog[]>;
}
