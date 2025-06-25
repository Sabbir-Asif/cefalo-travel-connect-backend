import { UUID } from "crypto";
import { db } from "../../configs/db";
import { User } from "../../interfaces/user";
import { Blog } from "../../interfaces/blog";
import { ILikedBlogRepository } from "../liked-blog";
import { LikedBlog, LikedBlogResponse } from "../../interfaces/liked-blog";

export class LikedBlogRepository implements ILikedBlogRepository {
    private tableName = "liked_blogs";

    async create(data: LikedBlog): Promise<LikedBlogResponse> {
        const [newLike] = await db(this.tableName)
            .insert(data)
            .returning("*");

        return {
            ...newLike,
            created_at: new Date(newLike.created_at),
        };
    }

    async delete(userId: UUID, blogId: UUID): Promise<number> {
        return await db(this.tableName)
            .where({ user_id: userId, blog_id: blogId })
            .del();
    }

    async update(data: LikedBlog): Promise<LikedBlogResponse> {
        const [updated] = await db(this.tableName)
            .where({ user_id: data.user_id, blog_id: data.blog_id })
            .update({ reaction_name: data.reaction_name })
            .returning("*");

        return {
            ...updated,
            created_at: new Date(updated.created_at),
        };
    }

    async findByUserAndBlog(userId: UUID, blogId: UUID): Promise<LikedBlogResponse> {
        const [record] = await db(this.tableName)
            .where({ user_id: userId, blog_id: blogId })
            .select("*");

        return {
            ...record,
            created_at: new Date(record.created_at),
        };
    }


    async usersForBlog(blogId: UUID): Promise<User[]> {
        const users = await db(this.tableName)
            .join("users", `${this.tableName}.user_id`, "users.id")
            .where(`${this.tableName}.blog_id`, blogId)
            .select("users.*");

        return users.map((user) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
        }));
    }

    async blogsForUser(userId: UUID): Promise<Blog[]> {
        const blogs = await db(this.tableName)
            .join("blogs", `${this.tableName}.blog_id`, "blogs.id")
            .where(`${this.tableName}.user_id`, userId)
            .select(
                "*",
                db.raw(`ST_X(location_points::geometry) as long`),
                db.raw(`ST_Y(location_points::geometry) as lat`)
            );

        return blogs.map((blog) => ({
            ...blog,
            location_points: {
                lat: parseFloat(blog.lat),
                long: parseFloat(blog.long),
            },
            tags: typeof blog.tags === "string" ? JSON.parse(blog.tags) : [],
            images: typeof blog.images === "string" ? JSON.parse(blog.images) : [],
            videos: typeof blog.videos === "string" ? JSON.parse(blog.videos) : [],
            created_at: new Date(blog.created_at),
            updated_at: new Date(blog.updated_at),
        }));
    }
}
