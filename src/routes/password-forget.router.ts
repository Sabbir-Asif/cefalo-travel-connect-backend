import { Router } from "express";
import { requestPasswordForget, forgetPassword } from "../controllers/password-reset";
import { errorHandler } from "../middlewares/error-handler";

export const passwordForgetRouter = Router();

passwordForgetRouter.post("/request", errorHandler(requestPasswordForget));
passwordForgetRouter.post("/reset", errorHandler(forgetPassword));
