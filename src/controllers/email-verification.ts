import { Request, Response } from "express";
import { EmailVerificationRepository } from "../repositories/impl/email-verification-impl";
import { UserRepository } from "../repositories/impl/user-impl";
import { EmailVerificationService } from "../services/email-verification";
import { UnprocessableEntityException } from "../exceptions/validation";
import { BadRequestException } from "../exceptions/bad-request";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { UUID } from "crypto";
import { InitiateVerificationSchema } from "../schemas/email-verification";

const emailVerificationRepository = new EmailVerificationRepository();
const userRepository = new UserRepository();
export const emailVerificationService = new EmailVerificationService(emailVerificationRepository, userRepository);

export const initiateVerification = async (req: Request, res: Response) => {
    const parsedBody = InitiateVerificationSchema.safeParse(req.body);
    if (!parsedBody.success) {
        throw new UnprocessableEntityException(parsedBody.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const { userId, email, name } = parsedBody.data;

    if (!userId) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    await emailVerificationService.initiateVerification(userId as UUID, email, name);

    res.status(200).json({ message: "Verification email sent" });
};

export const verifyEmail = async (req: Request, res: Response) => {
    const token = req.query.token;
    if (typeof token !== "string" || !token) {
        throw new BadRequestException("Verification token is required", ErrorCode.INVALID_VERIFICATION_TOKEN);
    }

    try {
        await emailVerificationService.verifyEmail(token);

        res.status(200).send(`
        <html>
          <head><title>Email Verified</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Congratulation! Email Verified Successfully</h1>
            <p>You can now close this tab or log in to your account.</p>
          </body>
        </html>
      `);
    } catch (err) {
        res.status(400).send(`
        <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Sorry, Verification Failed!</h1>
            <p>${(err as Error).message}</p>
          </body>
        </html>
      `);
    }
};
