import { db } from "../configs/db";
import { IPasswordResetRepository } from "../repositories/password-reset";
import { PasswordReset, CreatePasswordReset } from "../interfaces/password-reset";

export class PasswordResetRepository implements IPasswordResetRepository {
  private readonly table = "password_resets";

  async create(data: CreatePasswordReset): Promise<PasswordReset> {
    const [row] = await db(this.table)
      .insert({
        user_id: data.user_id,
        token: data.token,
        expires_at: data.expires_at,
      })
      .returning("*");

    return {
      ...row,
      created_at: new Date(row.created_at),
      expires_at: new Date(row.expires_at),
    };
  }

  async findByToken(token: string): Promise<PasswordReset | null> {
    const row = await db(this.table).where({ token }).first();
    return row
      ? {
          ...row,
          created_at: new Date(row.created_at),
          expires_at: new Date(row.expires_at),
        }
      : null;
  }

  async deleteByToken(token: string): Promise<void> {
    await db(this.table).where({ token }).del();
  }

  async deleteExpired(): Promise<number> {
    return db(this.table).where("expires_at", "<", new Date()).del();
  }
}
