import { db } from "../../configs/db";
import { CreateBlog, Blog } from "../../interfaces/blog";
import { IBlogRepository } from "../blog";

export class BlogRepository implements IBlogRepository {
    private tableName = 'blogs';
    async create(userId: number, blog: CreateBlog): Promise<Blog> {
        const [newBlog] = await db(this.tableName).insert({
            ...blog,
            userId,
            location_points: db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [blog.location_points.long, blog.location_points.lat]
            ),
            tags: JSON.stringify(blog.tags),
            images: JSON.stringify(blog.images),
            videos: JSON.stringify(blog.videos)
        }).returning([
            '*',
            db.raw(`ST_X(location_points::geometry) as long`),
            db.raw(`ST_Y(location_points::geometry) as lat`)
        ]);

        return {
            ...newBlog,
            location_points: {
                lat: parseFloat(newBlog.lat),
                long: parseFloat(newBlog.long),
            },
            created_at: new Date(newBlog.created_at),
            updated_at: new Date(newBlog.updated_at)
        };
    }

    async getAll(): Promise<Blog[]> {
        const blogs = await db(this.tableName).select(
            '*',
            db.raw(`ST_X(location_points::geometry) as long`),
            db.raw(`ST_Y(location_points::geometry) as lat`)
        );
        
        return blogs.map((blog) => ({
            ...blog,
            location_points: {
                lat: parseFloat(blog.lat),
                long: parseFloat(blog.long),
            },
            created_at: new Date(blog.created_at),
            updated_at: new Date(blog.updated_at)
        }));
    }

    async getById(id: number): Promise<Blog | null> {
        const blog = await db(this.tableName)
            .select(
                '*',
                db.raw(`ST_X(location_points::geometry) as long`),
                db.raw(`ST_Y(location_points::geometry) as lat`)
            )
            .where({ id })
            .first();
    
        return blog? {
            ...blog,
            location_points: {
                lat: parseFloat(blog.lat),
                long: parseFloat(blog.long),
            },
            created_at: new Date(blog.created_at),
            updated_at: new Date(blog.updated_at)
        } : null;
    }

}