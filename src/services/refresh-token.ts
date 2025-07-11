import { UUID } from 'crypto';
import { IRefreshTokenRepository } from '../repositories/refresh-token';
import { RefreshToken } from '../interfaces/token';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';

export class RefreshTokenService {
  constructor(private refreshTokenRepository: IRefreshTokenRepository) {}

  async issue(userId: UUID): Promise<RefreshToken> {
    return this.refreshTokenRepository.create(userId);
  }

  async verifyAndRotate(refreshToken: UUID): Promise<RefreshToken> {
    const existingToken = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!existingToken) {
      throw new UnauthorizedException('Refresh token not found', ErrorCode.UNAUTHORIZED);
    }

    if (existingToken.revoked) {
      throw new UnauthorizedException('Refresh token revoked', ErrorCode.UNAUTHORIZED);
    }

    if (new Date(existingToken.expires_at) < new Date()) {
      throw new UnauthorizedException('Refresh token expired', ErrorCode.UNAUTHORIZED);
    }

    return this.refreshTokenRepository.rotate(existingToken);
  }

  async revoke(tokenId: UUID): Promise<void> {
    await this.refreshTokenRepository.revoke(tokenId);
  }
}
