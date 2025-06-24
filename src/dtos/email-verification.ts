import { EmailVerification } from "../interfaces/email-verification";
import { UUID } from "crypto";

export class EmailVerificationDto {
  id: UUID;
  user_id: UUID;
  token: string;
  expires_at: Date;
  created_at: Date;

  constructor(data: EmailVerification) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.token = data.token;
    this.expires_at = new Date(data.expires_at);
    this.created_at = new Date(data.created_at);
  }
}
