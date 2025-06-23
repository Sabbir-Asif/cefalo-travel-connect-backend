import { Router } from "express";
import { initiateVerification, verifyEmail } from "../controllers/email-verification";
import { authMiddleware } from "../middlewares/auth";

const emailVerificationRouter : Router = Router();

emailVerificationRouter.post("/initiate", initiateVerification);
emailVerificationRouter.get("/verify", verifyEmail);

export default emailVerificationRouter;
