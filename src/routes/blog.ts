import { Router } from "express";
import { createBlog } from "../controllers/blog";

export const blogRouter: Router = Router();

blogRouter.post('/',createBlog);