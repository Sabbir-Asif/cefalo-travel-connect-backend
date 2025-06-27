import { Router } from "express";
import { login, logout, refreshAccessToken, signup } from "../controllers/auth";
import { errorHandler } from "../global-error-handler";
import { passwordResetRouter } from "./password-reset";
import { authMiddleware } from "../middlewares/auth";

export const authRouter : Router = Router();

authRouter.post('/signup', errorHandler(signup));
authRouter.post('/login', errorHandler(login));
authRouter.post('/refresh-token', errorHandler(refreshAccessToken));
authRouter.post("/logout",authMiddleware, errorHandler(logout));
authRouter.use('/reset-password', authMiddleware, passwordResetRouter);