import { Router } from "express";
import { login, logout, refreshAccessToken, signup } from "../controllers/auth";
import { errorHandler } from "../global-error-handler";

export const authRouter : Router = Router();

authRouter.post('/signup', errorHandler(signup));
authRouter.post('/login', errorHandler(login));
authRouter.post('/refresh-token', errorHandler(refreshAccessToken));
authRouter.post("/logout", errorHandler(logout));