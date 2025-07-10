
import { Request, Response, NextFunction } from "express";
import { LikedBlogSchema } from "../schemas/liked-blog";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { BadRequestException } from "../exceptions/bad-request";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { IdSchema } from "../schemas/id";
import { UUID } from "crypto";
import { LikedBlogDto } from "../dtos/liked-blog";

import { LikedBlogRepository } from "../infrastructure/liked-blog-impl";
import { UserRepository } from "../infrastructure/user-impl";
import { BlogRepository } from "../infrastructure/blog-impl";
import { LikedBlogService } from "../services/liked-blog";
import { HttpStatusCode } from "../interfaces/status-code";

const likedBlogRepository = new LikedBlogRepository();
const userRepository = new UserRepository();
const blogRepository = new BlogRepository();

export const likedBlogService = new LikedBlogService(
    likedBlogRepository,
    userRepository,
    blogRepository
);

export const reactToBlog = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = LikedBlogSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User if not found!", ErrorCode.UNAUTHORIZED);
    }

    const createData = {
        ...parsed.data,
        user_id: parsedUserId.data as UUID
    } as LikedBlogDto
    const data = new LikedBlogDto(createData);

    const response = await likedBlogService.reactToBlog(data);
    res.status(HttpStatusCode.OK).json(response);
};

export const removeReaction = async (req: Request, res: Response, next: NextFunction) => {
    const blogIdParam = req.params.blogId;
    const parsedBlogId = IdSchema.safeParse(blogIdParam);
    if (!parsedBlogId.success) {
        throw new BadRequestException("Invalid blog id!", ErrorCode.INVALID_BLOG_ID);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not authenticated!", ErrorCode.UNAUTHORIZED);
    }

    const userId = parsedUserId.data as UUID;
    const blogId = parsedBlogId.data as UUID;

    await likedBlogService.removeReaction(userId, blogId);
    res.status(HttpStatusCode.NO_CONTENT).send();
};

export const getUsersWhoReacted = async (req: Request, res: Response, next: NextFunction) => {
    const blogIdParam = req.params.blogId;
    const parsedBlogId = IdSchema.safeParse(blogIdParam);
    if (!parsedBlogId.success) {
        throw new BadRequestException("Invalid blog id!", ErrorCode.INVALID_BLOG_ID);
    }

    const blogId = parsedBlogId.data as UUID;
    const users = await likedBlogService.getUsersWhoReacted(blogId);
    res.status(HttpStatusCode.OK).json(users);
};

export const getBlogsUserReacted = async (req: Request, res: Response, next: NextFunction) => {
    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not authenticated!", ErrorCode.UNAUTHORIZED);
    }

    const userId = parsedUserId.data as UUID;
    const blogs = await likedBlogService.getBlogsUserReacted(userId);
    res.status(HttpStatusCode.OK).json(blogs);
};
