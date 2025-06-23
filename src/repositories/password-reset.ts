import { PasswordReset, CreatePasswordReset } from "../interfaces/password-reset";

export interface IPasswordResetRepository {
  create(data: CreatePasswordReset): Promise<PasswordReset>;
  findByToken(token: string): Promise<PasswordReset | null>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
