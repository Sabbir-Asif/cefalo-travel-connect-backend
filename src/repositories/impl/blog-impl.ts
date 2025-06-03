import { db } from "../../configs/db";
import { CreateBlog, Blog } from "../../interfaces/blog";
import { IBlogRepository } from "../blog";

export class BlogRepository implements IBlogRepository {
    private tableName = 'blogs';
    async create(userId: number, blog: CreateBlog): Promise<Blog> {
        const [newBlog] = await db(this.tableName).insert({
            ...blog,
            userId,
            location_points: db.raw(`ST_GeographyFromText('SRID=4326;POINT(? ?)')`,
                [blog.locationPoints.long, blog.locationPoints.lat]
            )
        }).returning([
            '*',
            db.raw(`ST_X(location_points::geometry) as long`),
            db.raw(`ST_Y(location_points::geometry) as lat`)
        ]);

        return {
            ...newBlog,
            locationPoints: {
                lat: parseFloat(newBlog.lat),
                long: parseFloat(newBlog.long),
            },
            created_at: new Date(newBlog.created_at),
            updated_at: new Date(newBlog.updated_at)
        }
    }
}