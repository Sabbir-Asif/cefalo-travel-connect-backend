import { userService } from "../controllers/user";
import { BlogResponseDto } from "../dtos/blog";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Blog, CreateBlog } from "../interfaces/blog";
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
}