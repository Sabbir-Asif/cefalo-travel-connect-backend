import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";

export const rootRouter: Router = Router();

rootRouter.use('/auth',authRouter);
rootRouter.use('/users',userRouter);