import { UUID } from "crypto";
import { IBlogTransportRepository } from "../blogTransport";
import { db } from "../../configs/db";
import { Transport } from "../../interfaces/transport";
import { BlogTransport } from "../../interfaces/blogTransport";

export class BlogTransportRepository implements IBlogTransportRepository {
    private tableName = 'blog_transports';

    async create(blogId: UUID, transportId: UUID): Promise<BlogTransport> {
        const [newBlogTransport] = await db(this.tableName).insert({
            blog_id: blogId,
            transport_id: transportId
        }).returning(['*']);

        return {
            blog_id: newBlogTransport.blog_id,
            transport_id: newBlogTransport.transport_id,
        };
    }

    async delete(blogId: UUID, transportId: UUID): Promise<number> {
        const result = await db(this.tableName)
            .where({ blog_id: blogId, transport_id: transportId })
            .delete();

        return result;
    }

    async transportForBlog(blogId: UUID): Promise<Transport[]> {
        const transports = await db(this.tableName)
            .join('transports', 'blog_transports.transport_id', 'transports.id')
            .where('blog_transports.blog_id', blogId)
            .select(
                'transports.*',
                db.raw(`ST_X(transports.starting_point::geometry) as start_long`),
                db.raw(`ST_Y(transports.starting_point::geometry) as start_lat`),
                db.raw(`ST_X(transports.destination_point::geometry) as des_long`),
                db.raw(`ST_Y(transports.destination_point::geometry) as des_lat`)
            );

        return transports.map((transport) => ({
            ...transport,
            starting_point: {
                lat: parseFloat(transport.start_lat),
                long: parseFloat(transport.start_long)
            },
            destination_point: {
                lat: parseFloat(transport.des_lat),
                long: parseFloat(transport.des_long)
            },
            created_at: new Date(transport.created_at),
            updated_at: new Date(transport.updated_at)
        }));
    }
}