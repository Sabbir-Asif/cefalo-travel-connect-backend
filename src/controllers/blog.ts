import { UserRepository } from './../infrastructure/user-impl';
import { NextFunction, Request, Response } from "express"
import { CreateBlogSchema, UpdateBlogSchema } from "../schemas/blog"
import { UnprocessableEntityException } from "../exceptions/validation"
import { ErrorCode } from "../exceptions/root"
import { CreateBlogDto, UpdateBlogDto } from "../dtos/blog"
import { BadRequestException } from "../exceptions/bad-request"
import { Blog, CreateBlog, UpdateBlog } from "../interfaces/blog"
import { BlogRepository } from "../infrastructure/blog-impl"
import { BlogService } from "../services/blog"
import { UnauthorizedException } from "../exceptions/unauthorized"
import { IdSchema } from "../schemas/id"
import { UUID } from "crypto"
import { TransportRepository } from "../infrastructure/transport-impl"
import { LodgeRepository } from "../infrastructure/lodge-impl"
import { BlogInsightRepository } from "../infrastructure/blog-insight-impl"
import { BlogTransportRepository } from "../infrastructure/blogTransport-impl"
import { BlogLodgeRepository } from "../infrastructure/blog-lodge-impl"
import { BlogFoodRepository } from "../infrastructure/blog-food-impl"


const blogRepository = new BlogRepository();
const blogTransportRepository = new BlogTransportRepository();
const blogLodgeRepository = new BlogLodgeRepository();
const blogInsightRepository = new BlogInsightRepository();
const blogFoodRepository = new BlogFoodRepository()
const userRepository = new UserRepository()

export let blogService = new BlogService(
    blogRepository,
    blogTransportRepository,
    blogLodgeRepository,
    blogInsightRepository,
    blogFoodRepository,
    userRepository
);

export const __setBlogService = (svc: BlogService) => { blogService = svc; }

export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = CreateBlogSchema.safeParse(req.body)
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);

    if (!parsedUserId.success) {
        throw new UnauthorizedException('User not found!', ErrorCode.USER_NOTFOUND)
    }

    const userId = parsedUserId.data as UUID;

    const blogCreateDto: CreateBlog = new CreateBlogDto(parsed.data)

    const blog: Blog = await blogService.createBlog(userId, blogCreateDto);

    res.status(201).json(blog);
}

export const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
    const blogs: Blog[] = await blogService.getAllBlogs();

    res.status(200).json(blogs);
}

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {

    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid blog id!', ErrorCode.INVALID_BLOG_ID);
    }

    const blogId = parsedId.data as UUID;

    const blog = await blogService.getBlogById(blogId);

    res.status(200).json(blog);
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {

    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid blog id!', ErrorCode.INVALID_BLOG_ID);
    }

    const blogId = parsedId.data as UUID;

    const parsed = UpdateBlogSchema.safeParse(req.body);

    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);

    if (!parsedUserId.success) {
        throw new UnauthorizedException('User not found!', ErrorCode.USER_NOTFOUND)
    }

    const userId = parsedUserId.data as UUID;

    const blogUpdateDto: UpdateBlog = new UpdateBlogDto(req.body);

    const blog: Blog = await blogService.updateBlog(blogId, userId, blogUpdateDto);

    res.status(200).json(blog);
}

export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {

    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid blog id!', ErrorCode.INVALID_BLOG_ID);
    }

    const blogId = parsedId.data as UUID;

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);

    if (!parsedUserId.success) {
        throw new UnauthorizedException('User not found!', ErrorCode.USER_NOTFOUND)
    }

    const userId = parsedUserId.data as UUID;

    const count = await blogService.deleteBlog(blogId, userId);

    res.status(204).json({ count });
}

export const searchBlogs = async (req: Request, res: Response, next: NextFunction) => {
    const queryParams = req.query;

    const blogs = await blogService.searchBlogs(queryParams);

    res.status(200).json(blogs);
};

export const getBlogWithAllInfo = async (req: Request, res: Response, next: NextFunction) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid blog id!', ErrorCode.INVALID_BLOG_ID);
    }

    const blogId = parsedId.data as UUID;

    const fullBlogInfo = await blogService.BlogWithAllInfo(blogId);

    res.status(200).json(fullBlogInfo);
};