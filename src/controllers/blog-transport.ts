import { Request, Response } from "express";
import { BlogTransportRepository } from "../repositories/impl/blogTransport-impl";
import { BlogTransportService } from "../services/blog-transport";
import { BlogTransportSchema } from "../schemas/blog-transport";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { BlogTransport } from "../interfaces/blog-transport";
import { IdSchema } from "../schemas/id";
import { UUID } from "crypto";
import { BlogTransportDto } from "../dtos/blog-transport";

const blogTransportRepository = new BlogTransportRepository();
const blogTransportSercive = new BlogTransportService(blogTransportRepository);

export const createBlogtransport = async (req: Request, res: Response) => {
    const parsed = BlogTransportSchema.safeParse(req.body);
    if(!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const parsedData = parsed.data as BlogTransport;
    
    const blogTransportCreateDto = new BlogTransportDto(parsedData) as BlogTransport;

    const blogTransport : BlogTransport = await blogTransportSercive.createBlogTransport(blogTransportCreateDto.blog_id, blogTransportCreateDto.transport_id);

    res.status(201).json(blogTransport);
}

export const getTransportsForBlog = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new UnprocessableEntityException(parsedId.error, "Invalid blog id!", ErrorCode.INVALID_BLOG_ID);
    }

    const blogId = parsedId.data as UUID;
    
    const transports = await blogTransportSercive.getTransportsForBlog(blogId);

    res.status(200).json(transports);
}

export const deleteBlogTransport = async (req: Request, res: Response) => {
    const blogId = req.params.blogId;
    const transportId = req.params.transportId;

    const parsedBlogId = IdSchema.safeParse(blogId);
    const parsedTransportId = IdSchema.safeParse(transportId);

    if (!parsedBlogId.success ) {
        throw new UnprocessableEntityException(parsedBlogId.error,"Invalid transport id!", ErrorCode.INVALID_BLOG_ID);
    }
    if (!parsedTransportId.success) {
        throw new UnprocessableEntityException(parsedTransportId.error, "Invalid transport id!", ErrorCode.INVALID_TRANSPORT_ID);
    }
    const deletedCount = await blogTransportSercive.deleteBlogTransport(parsedBlogId.data as UUID, parsedTransportId.data as UUID);

    res.status(204).json(deletedCount);
}