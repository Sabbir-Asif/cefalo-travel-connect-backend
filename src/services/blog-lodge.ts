import { UUID } from "crypto";
import { IBlogLodgeRepository } from "../repositories/blog-lodge";
import { BlogLodgeDto } from "../dtos/blog-lodge";
import { LodgeResponseDto } from "../dtos/lodge";
import { blogService } from "../controllers/blog";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { lodgeService } from "../controllers/lodge";

export class BlogLodgeService {
  constructor(private blogLodgeRepository: IBlogLodgeRepository) {}

  async createBlogLodge(blogId: UUID, lodgeId: UUID): Promise<BlogLodgeDto> {

    const existingBlog = await blogService.getBlogById(blogId);
    if(!existingBlog) {
        throw new NotFoundException('Blog not found!', ErrorCode.BLOG_NOT_FOUND);
    }

    const existingLodge = await lodgeService.getLodgeById(lodgeId);
    if(!existingLodge) {
        throw new NotFoundException('Lodge not found!', ErrorCode.LODGE_NOT_FOUND);
    }
    
    const result = await this.blogLodgeRepository.create(blogId, lodgeId);
    return new BlogLodgeDto(result);
  }

  async deleteBlogLodge(blogId: UUID, lodgeId: UUID): Promise<number> {
    return await this.blogLodgeRepository.delete(blogId, lodgeId);
  }

  async getLodgesForBlog(blogId: UUID): Promise<LodgeResponseDto[]> {
    const lodges = await this.blogLodgeRepository.lodgesForBlog(blogId);
    return lodges.map(lodge => new LodgeResponseDto(lodge));
  }
}
