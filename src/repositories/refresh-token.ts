import { UUID } from 'crypto';
import { RefreshToken } from '../interfaces/token';

export interface IRefreshTokenRepository {
  create(userId: UUID): Promise<RefreshToken>;
  findByToken(token: UUID): Promise<RefreshToken | null>;
  revoke(tokenId: UUID): Promise<void>;
  rotate(oldToken: RefreshToken): Promise<RefreshToken>;
}
