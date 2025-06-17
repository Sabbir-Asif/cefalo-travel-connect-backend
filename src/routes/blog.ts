import { Router } from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, searchBlogs, updateBlog } from "../controllers/blog";
import { errorHandler } from "../global-error-handler";
import { authMiddleware } from "../middlewares/auth";

export const blogRouter: Router = Router();

blogRouter.get('/search', authMiddleware, errorHandler(searchBlogs));
blogRouter.post('/', authMiddleware, errorHandler(createBlog));
blogRouter.get('/',authMiddleware, errorHandler(getAllBlogs));
blogRouter.get('/:id', authMiddleware, errorHandler(getBlogById));
blogRouter.put('/:id', authMiddleware, errorHandler(updateBlog));
blogRouter.delete('/:id', authMiddleware, errorHandler(deleteBlog));
