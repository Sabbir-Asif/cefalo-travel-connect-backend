import { UUID } from "crypto";

export interface EmailVerification {
  id: UUID;
  user_id: UUID;
  token: string;
  expires_at: Date;
  created_at: Date;
}
