import { Router } from "express";
import { login, logout, refreshAccessToken, signup } from "../controllers/auth";
import { errorHandler } from "../middlewares/error-handler";
import { passwordForgetRouter } from "./password-forget.router";
import { authMiddleware } from "../middlewares/auth";

export const authRouter : Router = Router();

authRouter.post('/signup', errorHandler(signup));
authRouter.post('/login', errorHandler(login));
authRouter.post('/refresh-token', errorHandler(refreshAccessToken));
authRouter.post("/logout",authMiddleware, errorHandler(logout));
authRouter.use('/forger-password', authMiddleware, passwordForgetRouter);