import { UUID } from "crypto";
import { db } from "../configs/db";
import { IBlogLodgeRepository } from "../repositories/blog-lodge";
import { BlogLodge } from "../interfaces/blog-lodge";
import { Lodge } from "../interfaces/lodge";

export class BlogLodgeRepository implements IBlogLodgeRepository {
    private tableName = "blog_lodges";

    async create(blogId: UUID, lodgeId: UUID): Promise<BlogLodge> {
        const [newBlogLodge] = await db(this.tableName)
            .insert({ blog_id: blogId, lodge_id: lodgeId })
            .returning("*");

        return {
            blog_id: newBlogLodge.blog_id,
            lodge_id: newBlogLodge.lodge_id
        };
    }

    async delete(blogId: UUID, lodgeId: UUID): Promise<number> {
        return await db(this.tableName)
            .where({ blog_id: blogId, lodge_id: lodgeId })
            .del();
    }

    async lodgesForBlog(blogId: UUID): Promise<Lodge[]> {
        const lodges = await db(this.tableName)
            .join("lodges", "blog_lodges.lodge_id", "lodges.id")
            .where("blog_lodges.blog_id", blogId)
            .select(
                "lodges.*",
                db.raw(`ST_X(lodges.location_point::geometry) as long`),
                db.raw(`ST_Y(lodges.location_point::geometry) as lat`)
            );

        return lodges.map(lodge => {
            const { lat, long, created_at, updated_at, ...lodgeWithoutCoords } = lodge;
            return {
            ...lodgeWithoutCoords,
            location_point: {
                lat: parseFloat(lodge.lat),
                long: parseFloat(lodge.long),
            },
            created_at: new Date(lodge.created_at),
            updated_at: new Date(lodge.updated_at),
        }});
    }
}
