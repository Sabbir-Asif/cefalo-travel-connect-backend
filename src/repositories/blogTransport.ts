import { UUID } from "crypto";
import { BlogTransport } from "../interfaces/blogTransport";
import { Transport } from "../interfaces/transport";

export interface IBlogTransportRepository {
    create(blogId: UUID, transportId: UUID): Promise<BlogTransport>;
    delete(blogId: UUID, transportId: UUID): Promise<number>;
    transportForBlog(blogId: UUID): Promise<Transport[]>
}