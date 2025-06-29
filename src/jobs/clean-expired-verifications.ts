import { EmailVerificationRepository } from "../infrastructure/email-verification-impl";
import { PasswordResetRepository } from "../infrastructure/password-reset-impl";
import { EmailVerificationService } from "../services/email-verification";
import { PasswordResetService } from "../services/password-reset";

const emailVerificationRepository = new EmailVerificationRepository();
const emailVerificationService = new EmailVerificationService(emailVerificationRepository, null as any);

const resetPasswordRepository = new PasswordResetRepository();
const resetPasswordService = new PasswordResetService(resetPasswordRepository, null as any);

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

export const cleanExpiredPasswordResets = async () => {
    try {
        const deletedCount = await resetPasswordService.cleanupExpired();
        if (deletedCount > 0) {
            console.log(`[CRON] Deleted ${deletedCount} expired password reset tokens`);
        }
    } catch (error) {
        console.error("[CRON] Failed to clean expired password resets:", error);
    }
}