import jwt from 'jsonwebtoken';
import { privateKey, publicKey } from '../configs/keys';
import { UUID } from 'crypto';
import { ACCESS_TOKEN_EXPIRES_IN } from '../configs/secrets';


export const TokenService = {
  signAccessToken(userId: UUID): string {
    return jwt.sign({ userId }, privateKey, {
      algorithm: 'RS256',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  },

  verifyAccessToken(token: string): { userId: UUID } {
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    }) as { userId: UUID };
  },

  decode(token: string) {
    return jwt.decode(token);
  }
};
