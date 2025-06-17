import { UUID } from "crypto";
import { db } from "../../configs/db";
import { CreateBlog, Blog, UpdateBlog } from "../../interfaces/blog";
import { IBlogRepository } from "../blog";
import { IdSchema } from "../../schemas/id";

export class BlogRepository implements IBlogRepository {
    private tableName = 'blogs';
    async create(userId: UUID, blog: CreateBlog): Promise<Blog> {
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

    async getById(id: UUID): Promise<Blog | null> {
        const blog = await db(this.tableName)
            .select(
                '*',
                db.raw(`ST_X(location_points::geometry) as long`),
                db.raw(`ST_Y(location_points::geometry) as lat`)
            )
            .where({ id })
            .first();

        return blog ? {
            ...blog,
            location_points: {
                lat: parseFloat(blog.lat),
                long: parseFloat(blog.long),
            },
            created_at: new Date(blog.created_at),
            updated_at: new Date(blog.updated_at)
        } : null;
    }

    async update(id: UUID, data: UpdateBlog): Promise<Blog> {
        const updateData: any = {
            ...data,
            updated_at: new Date()
        };

        if (data.location_points) {
            updateData.location_points = db.raw(
                `ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`,
                [data.location_points.long, data.location_points.lat]
            );
        }

        if (data.tags) updateData.tags = JSON.stringify(data.tags);
        if (data.images) updateData.images = JSON.stringify(data.images);
        if (data.videos) updateData.videos = JSON.stringify(data.videos);
        const [updatedBlog] = await db(this.tableName)
            .where({ id })
            .update(updateData)
            .returning([
                '*',
                db.raw(`ST_X(location_points::geometry) as long`),
                db.raw(`ST_Y(location_points::geometry) as lat`)
            ]);

        return {
            ...updatedBlog,
            location_points: {
                lat: parseFloat(updatedBlog.lat),
                long: parseFloat(updatedBlog.long),
            },
            created_at: new Date(updatedBlog.created_at),
            updated_at: new Date(updatedBlog.updated_at),
        };
    }

    async delete(id: UUID): Promise<number> {
        const count = await db(this.tableName).where({ id }).del();
        return count;
    }

    async search(params: Record<string, any>): Promise<Blog[]> {
        const query = db(this.tableName)
            .select(
                '*',
                db.raw(`ST_X(location_points::geometry) as long`),
                db.raw(`ST_Y(location_points::geometry) as lat`)
            );

        const { lat, long, radius = 10000, ...filters } = params;

        const UUID_FIELDS = ['id', 'userId'];

        for (const key in filters) {
            const value = filters[key];

            if (Array.isArray(value)) {
                const parsed = UUID_FIELDS.includes(key)
                    ? value.filter((v: any) => IdSchema.safeParse(v).success)
                    : value;
                query.whereIn(key, parsed);
            } else if (UUID_FIELDS.includes(key)) {
                if (IdSchema.safeParse(value).success) {
                    query.where(key, value);
                }
            } else {
                query.whereILike(key, `%${value}%`);
            }
        }

        if (lat && long) {
            const latNum = parseFloat(lat);
            const longNum = parseFloat(long);

            if (!isNaN(latNum) && !isNaN(longNum)) {
                query.whereRaw(
                    `ST_DWithin(location_points, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)`,
                    [longNum, latNum, radius]
                );
            }
        }

        const blogs = await query;

        return blogs.map(blog => ({
            ...blog,
            location_points: {
                lat: parseFloat(blog.lat),
                long: parseFloat(blog.long),
            },
            created_at: new Date(blog.created_at),
            updated_at: new Date(blog.updated_at),
        }));
    }

}