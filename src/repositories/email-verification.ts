import { EmailVerification } from "../interfaces/email-verification";
import { UUID } from "crypto";

export interface IEmailVerificationRepository {
  create(userId: UUID, token: string, expiresAt: Date): Promise<EmailVerification>;
  findByToken(token: string): Promise<EmailVerification | null>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
