import { Request, Response } from "express";
import { PasswordResetRepository } from "../infrastructure/password-reset-impl";
import { UserRepository } from "../infrastructure/user-impl";
import { PasswordResetService } from "../services/password-reset";
import { InitiatePasswordResetSchema, CompletePasswordResetSchema } from "../schemas/password-reset";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { HttpStatusCode } from "../interfaces/status-code";

const passwordResetRepository = new PasswordResetRepository();
const userRepository = new UserRepository();
export const passwordResetService = new PasswordResetService(
  passwordResetRepository,
  userRepository
);

export const requestPasswordForget = async (req: Request, res: Response) => {
  const parsed = InitiatePasswordResetSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error,"Validation failed",ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const { email } = parsed.data;
  await passwordResetService.initiateReset(email);
  res.status(HttpStatusCode.OK).json({ message: "Password reset email sent" });
};

export const forgetPassword = async (req: Request, res: Response) => {
  const parsed = CompletePasswordResetSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error,"Validation failed",ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const { token, password } = parsed.data;
  await passwordResetService.resetPassword(token, password);
  res.status(HttpStatusCode.OK).json({ message: "Password reset successful" });
};
