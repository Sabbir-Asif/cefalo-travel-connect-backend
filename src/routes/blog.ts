import { authMiddleware } from './../middlewares/auth';
import { Router } from "express";
import { createBlog } from "../controllers/blog";
import { errorHandler } from "../global-error-handler";

export const blogRouter: Router = Router();

blogRouter.post('/', authMiddleware, errorHandler(createBlog));