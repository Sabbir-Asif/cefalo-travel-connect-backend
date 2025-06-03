import { NextFunction, Request, Response } from "express"
import { CreateBlogSchema } from "../schemas/blog"

export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = CreateBlogSchema.safeParse(req.body)
}