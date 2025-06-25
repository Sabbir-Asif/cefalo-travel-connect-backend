import { UserResponseDto } from './../dtos/user';
import { UUID } from "crypto";
import { LikedBlog, LikedBlogResponse } from "../interfaces/liked-blog";
import { ILikedBlogRepository } from "../repositories/liked-blog";
import { IUserRepository } from "../repositories/user";
import { IBlogRepository } from "../repositories/blog";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { LikedBlogResponseDto } from "../dtos/liked-blog";
import { User, UserResponse } from "../interfaces/user";
import { Blog } from "../interfaces/blog";
import { BlogResponseDto } from '../dtos/blog';

export class LikedBlogService {
    constructor(
        private likedBlogRepository: ILikedBlogRepository,
        private userRepository: IUserRepository,
        private blogRepository: IBlogRepository
    ) {}

    async reactToBlog(data: LikedBlog): Promise<LikedBlogResponse> {

        const user = await this.userRepository.findById(data.user_id);
        if (!user) {
            throw new NotFoundException(`User with ID ${data.user_id} not found`, ErrorCode.USER_NOTFOUND);
        }

        const blog = await this.blogRepository.getById(data.blog_id);
        if (!blog) {
            throw new NotFoundException(`Blog not found`, ErrorCode.BLOG_NOT_FOUND);
        }

        const existing = await this.likedBlogRepository.findByUserAndBlog(data.user_id, data.blog_id);

        if (existing) {
            if (existing.reaction_name === data.reaction_name) {
                return new LikedBlogResponseDto(existing);
            }

            const updated = await this.likedBlogRepository.update(data);
            return new LikedBlogResponseDto(updated);
        }

        const created = await this.likedBlogRepository.create(data);
        return new LikedBlogResponseDto(created);
    }

    async removeReaction(userId: UUID, blogId: UUID): Promise<void> {

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`, ErrorCode.USER_NOTFOUND);
        }

        const blog = await this.blogRepository.getById(blogId);
        if (!blog) {
            throw new NotFoundException(`Blog with ID ${blogId} not found`, ErrorCode.BLOG_NOT_FOUND);
        }

        const count = await this.likedBlogRepository.delete(userId, blogId);
        if (count === 0) {
            throw new NotFoundException(
                `No reaction found for user on blog`,
                ErrorCode.REACTION_NOT_FOUND
            );
        }
    }

    async getUsersWhoReacted(blogId: UUID): Promise<UserResponse[]> {
        const blog = await this.blogRepository.getById(blogId);
        if (!blog) {
            throw new NotFoundException(`Blog not found`, ErrorCode.BLOG_NOT_FOUND);
        }

        const users : User[] =  await this.likedBlogRepository.usersForBlog(blogId);

        return users.map(user => new UserResponseDto(user))
    }

    async getBlogsUserReacted(userId: UUID): Promise<Blog[]> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(`User not found`, ErrorCode.USER_NOTFOUND);
        }

        const blogs = await this.likedBlogRepository.blogsForUser(userId);

        return blogs.map(blog => new BlogResponseDto(blog));
    }
}
