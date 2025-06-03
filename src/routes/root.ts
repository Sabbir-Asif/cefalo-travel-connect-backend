import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { blogRouter } from "./blog";

export const rootRouter: Router = Router();

rootRouter.use('/auth',authRouter);
rootRouter.use('/users',userRouter);
rootRouter.use('/blogs',blogRouter);