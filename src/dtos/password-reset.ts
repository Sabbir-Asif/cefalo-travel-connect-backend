import { PasswordReset, CreatePasswordReset } from "../interfaces/password-reset";
import { UUID } from "crypto";

export class CreatePasswordResetDto {
  user_id: UUID;
  token: string;
  expires_at: Date;

  constructor(data: CreatePasswordReset) {
    this.user_id = data.user_id;
    this.token = data.token;
    this.expires_at = data.expires_at;
  }
}

export class PasswordResetResponseDto {
  id: UUID;
  user_id: UUID;
  token: string;
  expires_at: Date;
  created_at: Date;

  constructor(data: PasswordReset) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.token = data.token;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
  }
}
