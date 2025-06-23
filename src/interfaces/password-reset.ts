import { UUID } from "crypto";

export interface PasswordReset {
  id: UUID;
  user_id: UUID;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface CreatePasswordReset {
  user_id: UUID;
  token: string;
  expires_at: Date;
}
