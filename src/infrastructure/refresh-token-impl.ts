import { db } from '../configs/db';
import { UUID, randomUUID } from 'crypto';
import { addDays } from 'date-fns';
import { RefreshToken } from '../interfaces/token';
import { IRefreshTokenRepository } from '../repositories/refresh-token';
import { REFRESH_TOKEN_EXPIRES_DAYS } from '../configs/secrets';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  private tableName = 'refresh_tokens';

  async create(userId: UUID): Promise<RefreshToken> {
    const token = randomUUID();
    const expiresAt = addDays(new Date(), REFRESH_TOKEN_EXPIRES_DAYS);

    const [newToken] = await db(this.tableName)
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
      })
      .returning('*');

    return {
      ...newToken,
      created_at: new Date(newToken.created_at),
      expires_at: new Date(newToken.expires_at),
    };
  }

  async findByToken(token: UUID): Promise<RefreshToken | null> {
    const result = await db(this.tableName).where({ token }).first();

    return result
      ? {
          ...result,
          created_at: new Date(result.created_at),
          expires_at: new Date(result.expires_at),
        }
      : null;
  }

  async revoke(tokenId: UUID): Promise<void> {
    await db(this.tableName).where({ id: tokenId }).update({ revoked: true });
  }

  async rotate(oldToken: RefreshToken): Promise<RefreshToken> {
    const newToken = await this.create(oldToken.user_id);

    await db(this.tableName)
      .where({ id: oldToken.id })
      .update({
        revoked: true,
        replaced_by: newToken.id,
      });

    return newToken;
  }
}
