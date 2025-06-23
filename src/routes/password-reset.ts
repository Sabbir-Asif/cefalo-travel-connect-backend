import { Router } from "express";
import { requestPasswordReset, resetPassword } from "../controllers/password-reset";
import { errorHandler } from "../global-error-handler";

export const passwordResetRouter = Router();

passwordResetRouter.post("/request", errorHandler(requestPasswordReset));
passwordResetRouter.post("/reset", errorHandler(resetPassword));
