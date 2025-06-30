import { Request, Response, NextFunction } from "express";
import { UUID } from "crypto";
import { BlogInsightRepository } from "../infrastructure/blog-insight-impl";
import { BlogInsightService } from "../services/blog-insight";
import { CreateBlogInsightSchema, UpdateBlogInsightSchema } from "../schemas/blog-insight";
import { IdSchema } from "../schemas/id";
import { UnprocessableEntityException } from "../exceptions/validation";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { CreateBlogInsightDto, UpdateBlogInsightDto } from "../dtos/blog-insight";
import { CreateBlogInsight, UpdateBlogInsight } from "../interfaces/blog-insight";

const blogInsightRepository = new BlogInsightRepository();
export let blogInsightService = new BlogInsightService(blogInsightRepository);

export const __setBlogInsightService = (svc: BlogInsightService) => { blogInsightService = svc; }

export const createBlogInsight = async (req: Request, res: Response, next: NextFunction) => {

    const blogIdParam = req.params.blogId;
    const parsedBlogId = IdSchema.safeParse(blogIdParam);
    if (!parsedBlogId.success) {
        throw new BadRequestException('Invalid blog Id!', ErrorCode.INVALID_BLOG_ID);
    }
    const blogId = parsedBlogId.data as UUID;

    const parsed = CreateBlogInsightSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;
    const createBlogInsightDto: CreateBlogInsight = new CreateBlogInsightDto(parsed.data);

    const insight = await blogInsightService.createInsight(userId, blogId, createBlogInsightDto);

    res.status(201).json(insight);
};

export const getAllBlogInsights = async (req: Request, res: Response) => {
    const insights = await blogInsightService.getAllInsights();
    
    res.status(200).json(insights);
};

export const getBlogInsightById = async (req: Request, res: Response) => {
    const insightIdParam = req.params.id;
    const parsedId = IdSchema.safeParse(insightIdParam);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid blog insight Id!', ErrorCode.INVALID_BLOG_INSIGHT_ID);
    }

    const insightId = parsedId.data as UUID;
    const insight = await blogInsightService.getInsightById(insightId);
    
    res.status(200).json(insight);
};

export const getBlogInsightsByBlogId = async (req: Request, res: Response) => {
    
    const blogIdParam = req.params.blogId;
    const parsedId = IdSchema.safeParse(blogIdParam);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid blog ID!', ErrorCode.INVALID_BLOG_ID);
    }

    const blogId = parsedId.data as UUID;
    const insights = await blogInsightService.getInsightByBlogId(blogId);

    res.status(200).json(insights);
};

export const updateBlogInsight = async (req: Request, res: Response) => {
    
    const insightIdParam = req.params.id;
    const parsedId = IdSchema.safeParse(insightIdParam);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid insight ID!', ErrorCode.INVALID_BLOG_INSIGHT_ID);
    }
    const insightId = parsedId.data as UUID;

    const parsed = UpdateBlogInsightSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;
    const blogInsightUpdateDto: UpdateBlogInsight = new UpdateBlogInsightDto(parsed.data);

    const updated = await blogInsightService.updateInsight(insightId, userId, blogInsightUpdateDto);

    res.status(200).json(updated);
};

export const deleteBlogInsight = async (req: Request, res: Response) => {
    
    const insightIdParam = req.params.id;
    const parsedId = IdSchema.safeParse(insightIdParam);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid insight ID!', ErrorCode.INVALID_BLOG_INSIGHT_ID);
    }
    const insightId = parsedId.data as UUID;

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;
    await blogInsightService.deleteInsight(insightId, userId);
    
    res.status(204).json({ success: true });
};

export const searchBlogInsights = async (req: Request, res: Response) => {
    const insights = await blogInsightService.searchInsights(req.query);
    res.status(200).json(insights);
};
