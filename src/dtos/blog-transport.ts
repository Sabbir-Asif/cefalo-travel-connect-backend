import { UUID } from "crypto";
import { BlogTransport, CreateBlogTransport } from "../interfaces/blog-transport";

export class BlogTransportDto {
    blog_id: UUID;
    transport_id: UUID;

    constructor(blogTransportData: BlogTransport) {
        this.blog_id = blogTransportData.blog_id;
        this.transport_id = blogTransportData.transport_id;
    }
}