import { UUID } from "crypto";

export interface RefreshToken {
    id: UUID;
    user_id: UUID;
    token: UUID;
    expires_at: Date;
    revoked: boolean;
    replaced_by?: UUID | null;
    created_at: Date;
}