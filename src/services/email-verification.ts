import { UUID, randomBytes } from "crypto";
import { IEmailVerificationRepository } from "../repositories/email-verification";
import { IUserRepository } from "../repositories/user";
import { UserResponseDto } from "../dtos/user";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { sendVerificationEmail } from "../utils/mailer";
import { UserResponse } from "../interfaces/user";
import { VERIFICATION_TOKEN_EXPIRY_MINUTES } from "../configs/secrets";

export class EmailVerificationService {
  constructor(
    private emailVerificationRepo: IEmailVerificationRepository,
    private userRepository: IUserRepository
  ) {}

  async initiateVerification(userId: UUID, email: string, name: string): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await this.emailVerificationRepo.create(userId, token, expiresAt);
    await sendVerificationEmail(email, name, token);
  }

  async verifyEmail(token: string): Promise<UserResponse> {
    const verification = await this.emailVerificationRepo.findByToken(token);

    if (!verification || new Date(verification.expires_at) < new Date()) {
      throw new BadRequestException("Token is invalid or expired", ErrorCode.TOKEN_EXPIRED);
    }

    const user = await this.userRepository.findById(verification.user_id);

    if (!user) {
      throw new NotFoundException("User not found", ErrorCode.USER_NOTFOUND);
    }

    if (user.is_verified) {
      throw new BadRequestException("User already verified", ErrorCode.ALREADY_VERIFIED);
    }

    await this.userRepository.update(user.id, { is_verified: true });
    await this.emailVerificationRepo.deleteByToken(token);

    return new UserResponseDto({ ...user, is_verified: true });
  }

  async cleanupExpired(): Promise<number> {
    return this.emailVerificationRepo.deleteExpired();
  }
}
