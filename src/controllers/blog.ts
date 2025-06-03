import { NextFunction, Request, Response } from "express"

export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
    res.json('create blog called');
}