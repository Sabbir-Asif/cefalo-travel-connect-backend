import { UUID } from "crypto";
import { IBlogTransportRepository } from "../repositories/blog-transport";
import { BlogTransportDto } from "../dtos/blog/blog-transport";
import { TransportResponseDto } from "../dtos/transport";

export class BlogTransportService {
    constructor(private blogTransportRepository: IBlogTransportRepository) {}
    
    async createBlogTransport(blogId: UUID, transportId: UUID) { 
        const blogTransport = await this.blogTransportRepository.create(blogId, transportId);
        return new BlogTransportDto(blogTransport);
    }
    async deleteBlogTransport(blogId: UUID, transportId: UUID) {
        const count = await this.blogTransportRepository.delete(blogId, transportId);
        return count;
    }
    async getTransportsForBlog(blogId: UUID) {
        const transports = await this.blogTransportRepository.transportForBlog(blogId);
        return transports.map(transport => new TransportResponseDto(transport));
    }
}