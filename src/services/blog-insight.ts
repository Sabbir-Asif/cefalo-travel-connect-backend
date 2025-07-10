import { UUID } from "crypto";
import { IBlogInsightRepository } from "../repositories/blog-insight";
import { BlogInsight, CreateBlogInsight, UpdateBlogInsight } from "../interfaces/blog-insight";
import { BlogInsightResponseDto } from "../dtos/blog/blog-insight";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { blogService } from "../controllers/blog";
import { userService } from "../controllers/user";
import { Role, UserResponse } from "../interfaces/user";
import { ForbiddenException } from "../exceptions/forbidden";

export class BlogInsightService {
    constructor(private blogInsightRepository: IBlogInsightRepository) { }

    async createInsight(userId: UUID, blogId: UUID, data: CreateBlogInsight): Promise<BlogInsight> {

        const blog = await blogService.getBlogById(blogId);
        if (!blog) {
            throw new NotFoundException(`Blog not found with id ${blogId}`, ErrorCode.BLOG_NOT_FOUND);
        }

        const user = await userService.getUserById(userId);
        if(!user) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        const insight = await this.blogInsightRepository.create(userId, blogId, data);

        return new BlogInsightResponseDto(insight);
    }

    async getAllInsights(): Promise<BlogInsight[]> {
        const insights = await this.blogInsightRepository.getAll();

        return insights.map((insight) => new BlogInsightResponseDto(insight));
    }

    async getInsightByBlogId(blogId: UUID): Promise<BlogInsightResponseDto[]> {
        const blog = await blogService.getBlogById(blogId);
        if (!blog) {
            throw new NotFoundException(`Blog not found with id ${blogId}`, ErrorCode.BLOG_NOT_FOUND);
        }

        const insights = await this.blogInsightRepository.getByBlogId(blogId);

        return insights.map((insight) => new BlogInsightResponseDto(insight));
    }

    async getInsightById(id: UUID): Promise<BlogInsight> {
        const insight = await this.blogInsightRepository.getById(id);

        if (!insight) {
            throw new NotFoundException(`Insight not found with id ${id}`, ErrorCode.BLOG_INSIGHT_NOT_FOUND);
        }

        return new BlogInsightResponseDto(insight);
    }

    async updateInsight(id: UUID, userId: UUID, data: UpdateBlogInsight): Promise<BlogInsightResponseDto> {
        const existingBlogInsight = await this.blogInsightRepository.getById(id);
        if (!existingBlogInsight) {
            throw new NotFoundException(`Insight not found with id ${id}`, ErrorCode.BLOG_INSIGHT_NOT_FOUND);
        }

        const user: UserResponse = await userService.getUserById(userId);

        if(!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOTFOUND);
        }

        if(user.id !== existingBlogInsight.user_id && user.role !== Role.ADMIN) {
            throw new ForbiddenException('Forbidden!', ErrorCode.FORBIDDEN);
        }

        const updatedBlogInsight = await this.blogInsightRepository.update(id, data);

        return new BlogInsightResponseDto(updatedBlogInsight);
    }

    async deleteInsight(id: UUID, userId: UUID): Promise<void> {
        const existingBlogInsight = await this.blogInsightRepository.getById(id);
        if (!existingBlogInsight) {
            throw new NotFoundException(`Insight not found with id ${id}`, ErrorCode.BLOG_INSIGHT_NOT_FOUND);
        }

        const user: UserResponse = await userService.getUserById(userId);

        if(!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOTFOUND);
        }

        if(user.id !== existingBlogInsight.user_id && user.role !== Role.ADMIN) {
            throw new ForbiddenException('Forbidden!', ErrorCode.FORBIDDEN);
        }

        return await this.blogInsightRepository.delete(id);
    }

    async searchInsights(params: {
        label?: string;
        data?: string;
        blog_id?: UUID;
        sortBy?: "label" | "created_at";
        order?: "asc" | "desc";
    }): Promise<BlogInsight[]> {
        const insights = await this.blogInsightRepository.search(params);
        return insights.map((insight) => new BlogInsightResponseDto(insight));
    }
}
