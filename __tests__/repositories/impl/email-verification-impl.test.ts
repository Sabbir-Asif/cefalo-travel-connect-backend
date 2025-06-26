import { EmailVerificationRepository } from '../../../src/repositories/impl/email-verification-impl';
import { EmailVerification } from '../../../src/interfaces/email-verification';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => {
  const mDb: any = jest.fn();
  return { db: mDb };
});

import { db } from '../../../src/configs/db';

describe('EmailVerificationRepository', () => {
  let repository: EmailVerificationRepository;
  let mockDb: jest.MockedFunction<any>;

  const userId = 'user-uuid' as UUID;
  const token = 'verification-token';
  const expiresAt = new Date('2025-12-31T23:59:59.000Z');

  const row: any = {
    id: 'verification-id',
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: '2025-01-01T00:00:00.000Z'
  };

  const expected: EmailVerification = {
    id: 'verification-id' as UUID,
    user_id: userId,
    token,
    expires_at: new Date(row.expires_at),
    created_at: new Date(row.created_at)
  };

  beforeEach(() => {
    repository = new EmailVerificationRepository();
    mockDb = db as jest.MockedFunction<any>;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return the verification record', async () => {
      const mockReturning = jest.fn().mockResolvedValue([row]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.mockReturnValue({ insert: mockInsert });

      const result = await repository.create(userId, token, expiresAt);

      expect(mockDb).toHaveBeenCalledWith('email_verifications');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: userId,
        token,
        expires_at: expiresAt
      });
      expect(mockReturning).toHaveBeenCalledWith('*');
      expect(result).toEqual(expected);
    });
  });

  describe('findByToken', () => {
    it('should return a verification record if token exists', async () => {
      const mockFirst = jest.fn().mockResolvedValue(row);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await repository.findByToken(token);

      expect(mockDb).toHaveBeenCalledWith('email_verifications');
      expect(mockWhere).toHaveBeenCalledWith({ token });
      expect(result).toEqual(expected);
    });

    it('should return null if token does not exist', async () => {
      const mockFirst = jest.fn().mockResolvedValue(null);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await repository.findByToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('deleteByToken', () => {
    it('should delete record by token', async () => {
      const mockDel = jest.fn().mockResolvedValue(1);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      await repository.deleteByToken(token);

      expect(mockDb).toHaveBeenCalledWith('email_verifications');
      expect(mockWhere).toHaveBeenCalledWith({ token });
      expect(mockDel).toHaveBeenCalled();
    });
  });

  describe('deleteExpired', () => {
    it('should delete all expired verifications and return count', async () => {
      const mockDel = jest.fn().mockResolvedValue(2);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await repository.deleteExpired();

      expect(mockDb).toHaveBeenCalledWith('email_verifications');
      expect(mockWhere).toHaveBeenCalledWith('expires_at', '<', expect.any(Date));
      expect(result).toBe(2);
    });
  });
});
