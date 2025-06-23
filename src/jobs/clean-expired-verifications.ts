import { EmailVerificationRepository } from "../repositories/impl/email-verification-impl";
import { EmailVerificationService } from "../services/email-verification";

const emailVerificationRepository = new EmailVerificationRepository();
const emailVerificationService = new EmailVerificationService(emailVerificationRepository, null as any);

export const cleanExpiredVerifications = async () => {
  try {
    const deletedCount = await emailVerificationService.cleanupExpired();
    if (deletedCount > 0) {
      console.log(`[CRON] Deleted ${deletedCount} expired email verification tokens`);
    }
  } catch (error) {
    console.error("[CRON] Failed to clean expired tokens:", error);
  }
};
