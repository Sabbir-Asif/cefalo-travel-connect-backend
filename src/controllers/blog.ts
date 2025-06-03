import { NextFunction, Request, Response } from "express"
import { CreateBlogSchema } from "../schemas/blog"
import { UnprocessableEntityException } from "../exceptions/validation"
import { ErrorCode } from "../exceptions/root"
import {  CreateBlogDto } from "../dtos/blog"
import { BadRequestException } from "../exceptions/bad-request"
import { Blog, CreateBlog } from "../interfaces/blog"
import { BlogRepository } from "../repositories/impl/blog-impl"
import { BlogService } from "../services/blog"


const blogRepository = new BlogRepository();
const blogService = new BlogService(blogRepository);

export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = CreateBlogSchema.safeParse(req.body)
    if(!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!",ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const userId = req.user?.id;
    if(!userId) {
        throw new BadRequestException('User not found!', ErrorCode.USER_NOTFOUND)
    }
    const blogCreateDto: CreateBlog = new CreateBlogDto(parsed.data)
    
    const blog: Blog = await blogService.createBlog(userId,blogCreateDto);

    res.status(201).json(blog);
}

export const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
    const blogs: Blog[] = await blogService.getAllusers();

    res.status(200).json(blogs);
}

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
    const blogId = parseInt(req.params.id);
    if (isNaN(blogId)) {
        throw new BadRequestException('Invalid blog id!',ErrorCode.INVALID_BLOG_ID);
    }

    const blog = await blogService.getBlogById(blogId);

    res.status(200).json(blog);
};