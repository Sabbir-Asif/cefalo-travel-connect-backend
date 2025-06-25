import { Router } from "express";
import { initiateVerification, verifyEmail } from "../controllers/email-verification";
import { errorHandler } from "../global-error-handler";

const emailVerificationRouter : Router = Router();

emailVerificationRouter.post("/initiate", errorHandler(initiateVerification));
emailVerificationRouter.get("/verify", errorHandler(verifyEmail));

export default emailVerificationRouter;
