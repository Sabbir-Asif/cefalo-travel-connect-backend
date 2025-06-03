import { NextFunction, Request, Response } from "express"
import { CreateBlogSchema } from "../schemas/blog"
import { UnprocessableEntityException } from "../exceptions/validation"
import { ErrorCode } from "../exceptions/root"
import { BlogResponseDto, CreateBlogDto } from "../dtos/blog"
import { BadRequestException } from "../exceptions/bad-request"
import { Blog } from "../interfaces/blog"
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
    const blogCreateDto = new CreateBlogDto(req.body)
    
    const blog: Blog = await blogService.createBlog(userId,blogCreateDto);

    res.status(201).json(blog);
}