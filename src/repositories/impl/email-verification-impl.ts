import { IEmailVerificationRepository } from "../email-verification";
import { EmailVerification } from "../../interfaces/email-verification";
import { UUID } from "crypto";
import { db } from "../../configs/db";

export class EmailVerificationRepository implements IEmailVerificationRepository {
  private table = "email_verifications";

  async create(userId: UUID, token: string, expiresAt: Date): Promise<EmailVerification> {
    const [row] = await db(this.table).insert({
      user_id: userId,
      token,
      expires_at: expiresAt
    }).returning("*");

    return {
      ...row,
      expires_at: new Date(row.expires_at),
      created_at: new Date(row.created_at)
    };
  }

  async findByToken(token: string): Promise<EmailVerification | null> {
    const row = await db(this.table).where({ token }).first();
    return row ? {
      ...row,
      expires_at: new Date(row.expires_at),
      created_at: new Date(row.created_at)
    } : null;
  }

  async deleteByToken(token: string): Promise<void> {
    await db(this.table).where({ token }).del();
  }

  async deleteExpired(): Promise<number> {
    const result = await db(this.table).where('expires_at', '<', new Date()).del();
    return result;
  }
}
