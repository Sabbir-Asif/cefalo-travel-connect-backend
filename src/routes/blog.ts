import { Router } from "express";
import { createBlog, getAllBlogs, getBlogById } from "../controllers/blog";
import { errorHandler } from "../global-error-handler";
import { authMiddleware } from "../middlewares/auth";

export const blogRouter: Router = Router();

blogRouter.post('/', authMiddleware, errorHandler(createBlog));
blogRouter.get('/',authMiddleware, errorHandler(getAllBlogs));
blogRouter.get('/:id', authMiddleware, errorHandler(getBlogById));
