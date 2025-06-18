import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { blogRouter } from "./blog";
import { transportRouter } from "./transport";
import { lodgeRouter } from "./lodge";

export const rootRouter: Router = Router();

rootRouter.use('/auth',authRouter);
rootRouter.use('/users',userRouter);
rootRouter.use('/blogs',blogRouter);
rootRouter.use('/transports',transportRouter);
rootRouter.use('/lodges', lodgeRouter);