import { UUID } from "crypto";
import { userService } from "../controllers/user";
import { BlogResponseDto } from "../dtos/blog";
import { ForbiddenException } from "../exceptions/forbidden";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Blog, CreateBlog, UpdateBlog } from "../interfaces/blog";
import { IBlogTransportRepository } from "../repositories/blog-transport";
import { IBlogRepository } from "../repositories/blog";
import { IBlogLodgeRepository } from "../repositories/blog-lodge";
import { IBlogInsightRepository } from "../repositories/blog-insight";
import { IBlogFoodRepository } from '../repositories/blog-food';
import { Transport } from "../interfaces/transport";
import { Lodge } from "../interfaces/lodge";
import { Food } from "../interfaces/food";
import { BlogInsight } from "../interfaces/blog-insight";

export class BlogService {
    constructor(
        private blogRepository: IBlogRepository,
        private blogTransportRepository: IBlogTransportRepository,
        private blogLodgeRepository: IBlogLodgeRepository,
        private blogInsightRepository: IBlogInsightRepository,
        private blogFoodRepository: IBlogFoodRepository
    ) { };

    async createBlog(userId: UUID, blogData: CreateBlog): Promise<Blog> {
        try {
            const user = await userService.getUserById(userId);
        } catch (err) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        const blog = await this.blogRepository.create(userId, blogData);
        return new BlogResponseDto(blog)
    }

    async getAllBlogs(): Promise<Blog[]> {

        const blogs = await this.blogRepository.getAll();

        return blogs.map(blog => new BlogResponseDto(blog));
    }

    async getBlogById(id: UUID): Promise<Blog> {
        const blog = await this.blogRepository.getById(id);

        if (!blog) {
            throw new NotFoundException(`No blog found with id ${id}`, ErrorCode.BLOG_NOT_FOUND)
        }

        return new BlogResponseDto(blog);
    }

    async updateBlog(id: UUID, userId: UUID, data: UpdateBlog): Promise<Blog> {
        const blog = await this.blogRepository.getById(id);
        if (!blog) {
            throw new NotFoundException(`No blog found with id ${id}`, ErrorCode.BLOG_NOT_FOUND)
        }
        if (userId !== blog.userId) {
            throw new ForbiddenException(`Userid ${userId} can not perform update on blog ${id}`, ErrorCode.FORBIDDEN);
        }

        const updatedBlog = await this.blogRepository.update(id, data);

        return new BlogResponseDto(updatedBlog);
    }

    async deleteBlog(id: UUID, userId: UUID): Promise<number> {
        const blog = await this.blogRepository.getById(id);
        if (!blog) {
            throw new NotFoundException(`No blog found with id ${id}`, ErrorCode.BLOG_NOT_FOUND)
        }
        if (userId !== blog.userId) {
            throw new ForbiddenException(`Userid ${userId} can not perform delete on blog ${id}`, ErrorCode.FORBIDDEN);
        }

        const count = await this.blogRepository.delete(id);

        return count;
    }

    async searchBlogs(params: Record<string, any>): Promise<Blog[]> {
        const blogs = await this.blogRepository.search(params);
        return blogs.map(blog => new BlogResponseDto(blog));
    }

    async BlogWithAllInfo(id: UUID) {
        const blog = await this.blogRepository.getById(id);

        if (!blog) {
            throw new NotFoundException(`No blog found with id ${id}`, ErrorCode.BLOG_NOT_FOUND)
        }
        const transports: Transport[] = await this.blogTransportRepository.transportForBlog(id);
        const lodges: Lodge[] = await this.blogLodgeRepository.lodgesForBlog(id);
        const food: Food[] = await this.blogFoodRepository.foodsForBlog(id);
        const insights: BlogInsight[] = await this.blogInsightRepository.getByBlogId(id);

        return {
            blog: new BlogResponseDto(blog),
            transports,
            lodges,
            food,
            insights
        };
    }

}