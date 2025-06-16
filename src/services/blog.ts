import { userService } from "../controllers/user";
import { BlogResponseDto } from "../dtos/blog";
import { ForbiddenException } from "../exceptions/forbidden";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { Blog, CreateBlog, UpdateBlog } from "../interfaces/blog";
import { IBlogRepository } from "../repositories/blog";

export class BlogService {
    constructor(private blogRepository: IBlogRepository) { };

    async createBlog(userId: number, blogData: CreateBlog): Promise<Blog> {
        try {
            const user = await userService.getUserById(userId);
        } catch (err) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        const blog = await this.blogRepository.create(userId, blogData);
        return new BlogResponseDto(blog)
    }

    async getAllusers(): Promise<Blog[]> {

        const blogs = await this.blogRepository.getAll();

        return blogs.map(blog => new BlogResponseDto(blog));
    }

    async getBlogById(id: number): Promise<Blog> {
        const blog = await this.blogRepository.getById(id);

        if (!blog) {
            throw new NotFoundException(`No blog found with id ${id}`, ErrorCode.BLOG_NOT_FOUND)
        }

        return new BlogResponseDto(blog);
    }

    async updateBlog(id: number, userId: number, data: UpdateBlog): Promise<Blog> {
        const blog = await this.blogRepository.getById(id);
        if (!blog) {
            throw new NotFoundException(`No blog found with id ${id}`, ErrorCode.BLOG_NOT_FOUND)
        }
        if(userId !== blog.userId) {
            throw new ForbiddenException(`Userid ${userId} can not perform update on blog ${id}`, ErrorCode.FORBIDDEN);
        }

        const updatedBlog = await this.blogRepository.update(id, data);

        return new BlogResponseDto(updatedBlog);
    }

}