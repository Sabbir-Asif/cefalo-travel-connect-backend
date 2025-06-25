import { UUID, randomBytes } from "crypto";
import { hash } from "bcrypt";
import { IPasswordResetRepository } from "../repositories/password-reset";
import { IUserRepository } from "../repositories/user";
import { sendPasswordResetEmail } from "../utils/mailer";
import { PASSWORD_RESET_TOKEN_EXPIRY_MINUTES, BCRYPT_SALT_ROUNDS } from "../configs/secrets";
import { BadRequestException } from "../exceptions/bad-request";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export class PasswordResetService {
  constructor(
    private passwordResetRepo: IPasswordResetRepository,
    private userRepo: IUserRepository
  ) {}

  async initiateReset(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found", ErrorCode.USER_NOTFOUND);
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await this.passwordResetRepo.create({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    await sendPasswordResetEmail(user.email, user.name, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetRecord = await this.passwordResetRepo.findByToken(token);

    if (!resetRecord || new Date(resetRecord.expires_at) < new Date()) {
      throw new BadRequestException("Token is invalid or expired", ErrorCode.TOKEN_EXPIRED);
    }

    const user = await this.userRepo.findById(resetRecord.user_id);
    if (!user) {
      throw new NotFoundException("User not found", ErrorCode.USER_NOTFOUND);
    }

    const hashedPassword = await hash(newPassword, BCRYPT_SALT_ROUNDS);
    await this.userRepo.update(user.id, { password: hashedPassword });
    await this.passwordResetRepo.deleteByToken(token);
  }

  async cleanupExpired(): Promise<number> {
    return this.passwordResetRepo.deleteExpired();
  }
}
