import { UUID } from "crypto";
import { db } from "../configs/db";
import { CreateBlog, Blog, UpdateBlog, Blog_Status, BlogResponse } from "../interfaces/blog";
import { IBlogRepository } from "../repositories/blog";
import { IdSchema } from "../schemas/id";
import { UserResponseDto } from "../dtos/user";

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

        return this.mapRowToBlog(newBlog);
    }

    async getAll(): Promise<BlogResponse[]> {
        const results = await db
            .select(
                "blogs.*",
                db.raw("ST_X(blogs.location_points::geometry) as long"),
                db.raw("ST_Y(blogs.location_points::geometry) as lat"),
                db.raw("row_to_json(users.*) as user")
            )
            .from("blogs")
            .leftJoin("users", "blogs.userId", "users.id");

        return results.map(this.toBlogWithUser);
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

        return blog ? this.mapRowToBlog(blog) : null;
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

        return this.mapRowToBlog(updatedBlog);
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

        return blogs.map(blog => (this.mapRowToBlog(blog)));
    }

    mapRowToBlog(row: any): Blog {
        return {
            id: row.id,
            title: row.title,
            userId: row.userId,
            locationName: row["locationName"] ?? '',
            location_points: {
                lat: parseFloat(row.lat),
                long: parseFloat(row.long),
            },
            description: row.description,
            cover_image: row.cover_image ?? null,
            status: row.status ?? Blog_Status.DRAFT,
            tags: row.tags,
            images: row.images,
            videos: row.videos,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }

    private toBlogWithUser = (row: any): BlogResponse => ({
        id: row.id,
        title: row.title,
        userId: row.user_id,
        user: new UserResponseDto(row.user),
        locationName: row["locationName"] ?? '',
        location_points: {
            lat: parseFloat(row.lat),
            long: parseFloat(row.long),
        },
        description: row.description,
        cover_image: row.cover_image ?? null,
        status: row.status ?? Blog_Status.DRAFT,
        tags: row.tags,
        images: row.images,
        videos: row.videos,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    });


}