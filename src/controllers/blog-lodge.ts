import { Request, Response } from "express";
import { BlogLodgeRepository } from "../repositories/impl/blog-lodge-impl";
import { BlogLodgeService } from "../services/blog-lodge";
import { BlogLodgeSchema } from "../schemas/blog-lodge";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { IdSchema } from "../schemas/id";
import { UUID } from "crypto";
import { CreateBlogLodge } from "../interfaces/blog-lodge";
import { BlogLodgeDto } from "../dtos/blog-lodge";

const blogLodgeRepository = new BlogLodgeRepository();
const blogLodgeService = new BlogLodgeService(blogLodgeRepository);

export const createBlogLodge = async (req: Request, res: Response) => {
  const parsed = BlogLodgeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const { blog_id, lodge_id } = new BlogLodgeDto(parsed.data as CreateBlogLodge);
  const result = await blogLodgeService.createBlogLodge(blog_id, lodge_id);

  res.status(201).json(result);
};

export const deleteBlogLodge = async (req: Request, res: Response) => {
  const blogId = IdSchema.safeParse(req.params.blogId);
  const lodgeId = IdSchema.safeParse(req.params.lodgeId);

  if (!blogId.success) {
    throw new UnprocessableEntityException(blogId.error, "Invalid blog ID", ErrorCode.INVALID_BLOG_ID);
  }
  if (!lodgeId.success) {
    throw new UnprocessableEntityException(lodgeId.error, "Invalid lodge ID", ErrorCode.INVALID_LODGE_ID);
  }

  const deleted = await blogLodgeService.deleteBlogLodge(blogId.data as UUID, lodgeId.data as UUID);
  
  res.status(204).json({ deleted });
};

export const getLodgesForBlog = async (req: Request, res: Response) => {
  const parsedId = IdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new UnprocessableEntityException(parsedId.error, "Invalid blog ID", ErrorCode.INVALID_BLOG_ID);
  }

  const lodges = await blogLodgeService.getLodgesForBlog(parsedId.data as UUID);

  res.status(200).json(lodges);
};
