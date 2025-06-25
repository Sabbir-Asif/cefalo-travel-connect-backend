import { PasswordResetRepository } from '../../../src/repositories/impl/password-reset-impl';
import { CreatePasswordReset, PasswordReset } from '../../../src/interfaces/password-reset';

jest.mock('../../../src/configs/db', () => ({
  db: jest.fn()
}));

import { db } from '../../../src/configs/db';

describe('PasswordResetRepository', () => {
  let passwordResetRepository: PasswordResetRepository;
  let mockDb: jest.MockedFunction<any>;

  const mockReset: PasswordReset = {
    id: 'reset-uuid-1234-5678-abcd-1234',
    user_id: 'user-uuid-123-abcd-1234',
    token: 'reset-token-abc',
    created_at: new Date('2023-06-01T12:00:00.000Z'),
    expires_at: new Date('2023-06-01T12:00:00.000Z'),
  };

  const mockCreate: CreatePasswordReset = {
    user_id: 'user-uuid-123-abcd-1234',
    token: 'reset-token-abc',
    expires_at: new Date('2023-06-30T12:00:00.000Z'),
  };

  beforeEach(() => {
    passwordResetRepository = new PasswordResetRepository();
    mockDb = db as jest.MockedFunction<any>;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert a password reset and return it', async () => {
      const mockReturning = jest.fn().mockResolvedValue([mockReset]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.mockReturnValue({ insert: mockInsert });

      const result = await passwordResetRepository.create(mockCreate);

      expect(mockDb).toHaveBeenCalledWith('password_resets');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockCreate.user_id,
        token: mockCreate.token,
        expires_at: mockCreate.expires_at,
      });
      expect(mockReturning).toHaveBeenCalledWith('*');
      expect(result).toEqual({
        ...mockReset,
        created_at: new Date(mockReset.created_at),
        expires_at: new Date(mockReset.expires_at),
      });
    });

    it('should throw if DB does not return any row', async () => {
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.mockReturnValue({ insert: mockInsert });

      await expect(passwordResetRepository.create(mockCreate)).rejects.toThrow();
    });
  });

  describe('findByToken', () => {
    it('should find a reset token and return password reset entry', async () => {
      const mockFirst = jest.fn().mockResolvedValue(mockReset);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await passwordResetRepository.findByToken('reset-token-abc');

      expect(mockDb).toHaveBeenCalledWith('password_resets');
      expect(mockWhere).toHaveBeenCalledWith({ token: 'reset-token-abc' });
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockReset,
        created_at: new Date(mockReset.created_at),
        expires_at: new Date(mockReset.expires_at),
      });
    });

    it('should return null if token not found', async () => {
      const mockFirst = jest.fn().mockResolvedValue(null);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await passwordResetRepository.findByToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('deleteByToken', () => {
    it('should delete the token without throwing error', async () => {
      const mockDel = jest.fn().mockResolvedValue(1);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      await passwordResetRepository.deleteByToken('reset-token-abc');

      expect(mockDb).toHaveBeenCalledWith('password_resets');
      expect(mockWhere).toHaveBeenCalledWith({ token: 'reset-token-abc' });
      expect(mockDel).toHaveBeenCalled();
    });

    it('should handle token not found gracefully', async () => {
      const mockDel = jest.fn().mockResolvedValue(0);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      await expect(
        passwordResetRepository.deleteByToken('non-existent-token')
      ).resolves.not.toThrow();
    });
  });

  describe('deleteExpired', () => {
    it('should delete all expired tokens and return the count', async () => {
      const mockDel = jest.fn().mockResolvedValue(2);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await passwordResetRepository.deleteExpired();

      expect(mockDb).toHaveBeenCalledWith('password_resets');
      expect(mockWhere).toHaveBeenCalledWith('expires_at', '<', expect.any(Date));
      expect(result).toBe(2);
    });

    it('should return 0 if no expired tokens exist', async () => {
      const mockDel = jest.fn().mockResolvedValue(0);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await passwordResetRepository.deleteExpired();

      expect(result).toBe(0);
    });
  });
});
