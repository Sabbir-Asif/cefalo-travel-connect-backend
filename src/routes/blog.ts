import { Router } from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, searchBlogs, updateBlog } from "../controllers/blog";
import { errorHandler } from "../global-error-handler";
import { authMiddleware } from "../middlewares/auth";
import { createBlogtransport, deleteBlogTransport, getTransportsForBlog } from "../controllers/blogTransport";

export const blogRouter: Router = Router();

blogRouter.post('/transports', authMiddleware, errorHandler(createBlogtransport));
blogRouter.get('/:id/transports', authMiddleware, errorHandler(getTransportsForBlog));
blogRouter.delete('/:blogId/transports/:transportId', authMiddleware, errorHandler(deleteBlogTransport));
blogRouter.get('/search', authMiddleware, errorHandler(searchBlogs));
blogRouter.post('/', authMiddleware, errorHandler(createBlog));
blogRouter.get('/',authMiddleware, errorHandler(getAllBlogs));
blogRouter.get('/:id', authMiddleware, errorHandler(getBlogById));
blogRouter.put('/:id', authMiddleware, errorHandler(updateBlog));
blogRouter.delete('/:id', authMiddleware, errorHandler(deleteBlog));
