import { Router } from "express";
import { authRouter } from "./auth";

export const rootRouter: Router = Router();

rootRouter.use('/auth',authRouter);