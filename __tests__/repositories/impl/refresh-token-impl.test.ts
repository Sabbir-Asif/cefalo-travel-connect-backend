import { RefreshTokenRepository } from '../../../src/infrastructure/refresh-token-impl';
import { RefreshToken } from '../../../src/interfaces/token';
import { UUID } from 'crypto';
import { addDays } from 'date-fns';

jest.mock('../../../src/configs/db', () => ({
    db: jest.fn()
}));

jest.mock('../../../src/configs/secrets', () => ({
    REFRESH_TOKEN_EXPIRES_DAYS: 7
}));

jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'),
    randomUUID: jest.fn()
}));

jest.mock('date-fns', () => ({
    addDays: jest.fn()
}));

import { db } from '../../../src/configs/db';
import { randomUUID } from 'crypto';
import { REFRESH_TOKEN_EXPIRES_DAYS } from '../../../src/configs/secrets';

describe('RefreshTokenRepository', () => {
    let refreshTokenRepository: RefreshTokenRepository;
    let mockDb: jest.MockedFunction<any>;
    let mockRandomUUID: jest.MockedFunction<typeof randomUUID>;
    let mockAddDays: jest.MockedFunction<typeof addDays>;
    let dateNowSpy: jest.SpyInstance;

    const mockUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' as UUID;
    const mockTokenId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' as UUID;
    const mockToken = 'token-12345-67890-abcdef' as UUID;
    const mockNewToken = 'new-token-12345-67890-abcdef' as UUID;

    const mockCurrentDate = new Date('2023-01-01T00:00:00.000Z');
    const mockExpiresAt = new Date('2023-01-08T00:00:00.000Z');

    const mockRefreshToken: RefreshToken = {
        id: mockTokenId,
        user_id: mockUserId,
        token: mockToken,
        expires_at: mockExpiresAt,
        created_at: mockCurrentDate,
        revoked: false,
        replaced_by: null
    };

    const mockDbRefreshToken = {
        id: mockTokenId,
        user_id: mockUserId,
        token: mockToken,
        expires_at: '2023-01-08T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        revoked: false,
        replaced_by: null
    };

    beforeEach(() => {
        refreshTokenRepository = new RefreshTokenRepository();
        mockDb = db as jest.MockedFunction<any>;
        mockRandomUUID = randomUUID as jest.MockedFunction<typeof randomUUID>;
        mockAddDays = addDays as jest.MockedFunction<typeof addDays>;

        jest.clearAllMocks();

        mockRandomUUID.mockReturnValue(mockToken);
        mockAddDays.mockReturnValue(mockExpiresAt);
        dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(mockCurrentDate.getTime());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('create', () => {
        it('should create a new refresh token successfully', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockDbRefreshToken]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await refreshTokenRepository.create(mockUserId);

            expect(mockRandomUUID).toHaveBeenCalled();
            expect(mockAddDays).toHaveBeenCalledWith(expect.any(Date), REFRESH_TOKEN_EXPIRES_DAYS);
            expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
            expect(mockInsert).toHaveBeenCalledWith({
                user_id: mockUserId,
                token: mockToken,
                expires_at: mockExpiresAt
            });
            expect(mockReturning).toHaveBeenCalledWith('*');
            expect(result).toEqual({
                ...mockDbRefreshToken,
                created_at: new Date(mockDbRefreshToken.created_at),
                expires_at: new Date(mockDbRefreshToken.expires_at)
            });
        });

        it('should generate unique token and correct expiry date', async () => {
            const customToken = 'custom-token-uuid' as UUID;
            const customExpiryDate = new Date('2023-02-01T00:00:00.000Z');

            mockRandomUUID.mockReturnValue(customToken);
            mockAddDays.mockReturnValue(customExpiryDate);

            const mockDbToken = { ...mockDbRefreshToken, token: customToken };
            const mockReturning = jest.fn().mockResolvedValue([mockDbToken]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await refreshTokenRepository.create(mockUserId);

            expect(mockInsert).toHaveBeenCalledWith({
                user_id: mockUserId,
                token: customToken,
                expires_at: customExpiryDate
            });
            expect(result.token).toBe(customToken);
        });
    });

    describe('findByToken', () => {
        it('should find refresh token by token successfully', async () => {
            const mockFirst = jest.fn().mockResolvedValue(mockDbRefreshToken);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await refreshTokenRepository.findByToken(mockToken);

            expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
            expect(mockWhere).toHaveBeenCalledWith({ token: mockToken });
            expect(mockFirst).toHaveBeenCalled();
            expect(result).toEqual({
                ...mockDbRefreshToken,
                created_at: new Date(mockDbRefreshToken.created_at),
                expires_at: new Date(mockDbRefreshToken.expires_at)
            });
        });

        it('should return null when token is not found', async () => {
            const mockFirst = jest.fn().mockResolvedValue(null);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await refreshTokenRepository.findByToken('non-existent-token' as UUID);

            expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
            expect(mockWhere).toHaveBeenCalledWith({ token: 'non-existent-token' });
            expect(mockFirst).toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should convert date strings to Date objects', async () => {
            const mockFirst = jest.fn().mockResolvedValue(mockDbRefreshToken);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await refreshTokenRepository.findByToken(mockToken);

            expect(result?.created_at).toBeInstanceOf(Date);
            expect(result?.expires_at).toBeInstanceOf(Date);
            expect(result?.created_at.toISOString()).toBe(mockDbRefreshToken.created_at);
            expect(result?.expires_at.toISOString()).toBe(mockDbRefreshToken.expires_at);
        });
    });

    describe('revoke', () => {
        it('should revoke a refresh token successfully', async () => {
            const mockUpdate = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
            mockDb.mockReturnValue({ where: mockWhere });

            await refreshTokenRepository.revoke(mockTokenId);

            expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
            expect(mockWhere).toHaveBeenCalledWith({ id: mockTokenId });
            expect(mockUpdate).toHaveBeenCalledWith({ revoked: true });
        });

        it('should handle revoking non-existent token gracefully', async () => {
            const mockUpdate = jest.fn().mockResolvedValue(0);
            const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
            mockDb.mockReturnValue({ where: mockWhere });

            await expect(refreshTokenRepository.revoke('non-existent-id' as UUID)).resolves.not.toThrow();

            expect(mockUpdate).toHaveBeenCalledWith({ revoked: true });
        });
    });

    describe('rotate', () => {
        it('should rotate refresh token successfully', async () => {
            const newTokenId = 'new-token-id-12345' as UUID;
            const mockNewDbRefreshToken = {
                ...mockDbRefreshToken,
                id: newTokenId,
                token: mockNewToken
            };

            const mockCreateReturning = jest.fn().mockResolvedValue([mockNewDbRefreshToken]);
            const mockCreateInsert = jest.fn().mockReturnValue({ returning: mockCreateReturning });

            const mockUpdate = jest.fn().mockResolvedValue(1);
            const mockUpdateWhere = jest.fn().mockReturnValue({ update: mockUpdate });

            mockRandomUUID.mockReturnValue(mockNewToken);

            mockDb
                .mockReturnValueOnce({ insert: mockCreateInsert })
                .mockReturnValueOnce({ where: mockUpdateWhere });

            const result = await refreshTokenRepository.rotate(mockRefreshToken);

            expect(mockDb).toHaveBeenNthCalledWith(1, 'refresh_tokens');
            expect(mockCreateInsert).toHaveBeenCalledWith({
                user_id: mockRefreshToken.user_id,
                token: mockNewToken,
                expires_at: mockExpiresAt
            });

            expect(mockDb).toHaveBeenNthCalledWith(2, 'refresh_tokens');
            expect(mockUpdateWhere).toHaveBeenCalledWith({ id: mockRefreshToken.id });
            expect(mockUpdate).toHaveBeenCalledWith({
                revoked: true,
                replaced_by: newTokenId
            });

            expect(result).toEqual({
                ...mockNewDbRefreshToken,
                created_at: new Date(mockNewDbRefreshToken.created_at),
                expires_at: new Date(mockNewDbRefreshToken.expires_at)
            });
        });

        it('should create new token with same user_id as old token', async () => {
            const newTokenId = 'new-token-id-12345' as UUID;
            const mockNewDbRefreshToken = {
                ...mockDbRefreshToken,
                id: newTokenId,
                token: mockNewToken
            };

            const mockCreateReturning = jest.fn().mockResolvedValue([mockNewDbRefreshToken]);
            const mockCreateInsert = jest.fn().mockReturnValue({ returning: mockCreateReturning });
            const mockUpdate = jest.fn().mockResolvedValue(1);
            const mockUpdateWhere = jest.fn().mockReturnValue({ update: mockUpdate });

            mockRandomUUID.mockReturnValue(mockNewToken);

            mockDb
                .mockReturnValueOnce({ insert: mockCreateInsert })
                .mockReturnValueOnce({ where: mockUpdateWhere });

            const customUserId = 'custom-user-id-12345' as UUID;
            const oldTokenWithCustomUser = { ...mockRefreshToken, user_id: customUserId };

            await refreshTokenRepository.rotate(oldTokenWithCustomUser);

            expect(mockCreateInsert).toHaveBeenCalledWith({
                user_id: customUserId,
                token: mockNewToken,
                expires_at: mockExpiresAt
            });
        });

        it('should handle database errors during rotation', async () => {
            const mockCreateReturning = jest.fn().mockRejectedValue(new Error('Database error'));
            const mockCreateInsert = jest.fn().mockReturnValue({ returning: mockCreateReturning });

            mockDb.mockReturnValue({ insert: mockCreateInsert });

            await expect(refreshTokenRepository.rotate(mockRefreshToken)).rejects.toThrow('Database error');
        });
    });

    describe('integration scenarios', () => {
        it('should handle token lifecycle: create -> find -> rotate -> revoke', async () => {
            const mockCreateReturning = jest.fn().mockResolvedValue([mockDbRefreshToken]);
            const mockCreateInsert = jest.fn().mockReturnValue({ returning: mockCreateReturning });

            const mockFirst = jest.fn().mockResolvedValue(mockDbRefreshToken);
            const mockFindWhere = jest.fn().mockReturnValue({ first: mockFirst });

            const newTokenId = 'new-token-id' as UUID;
            const mockNewDbToken = { ...mockDbRefreshToken, id: newTokenId, token: mockNewToken };
            const mockRotateCreateReturning = jest.fn().mockResolvedValue([mockNewDbToken]);
            const mockRotateCreateInsert = jest.fn().mockReturnValue({ returning: mockRotateCreateReturning });
            const mockRotateUpdate = jest.fn().mockResolvedValue(1);
            const mockRotateUpdateWhere = jest.fn().mockReturnValue({ update: mockRotateUpdate });

            const mockRevokeUpdate = jest.fn().mockResolvedValue(1);
            const mockRevokeWhere = jest.fn().mockReturnValue({ update: mockRevokeUpdate });

            mockRandomUUID.mockReturnValueOnce(mockToken).mockReturnValueOnce(mockNewToken);

            mockDb
                .mockReturnValueOnce({ insert: mockCreateInsert })
                .mockReturnValueOnce({ where: mockFindWhere }) // find
                .mockReturnValueOnce({ insert: mockRotateCreateInsert })
                .mockReturnValueOnce({ where: mockRotateUpdateWhere })
                .mockReturnValueOnce({ where: mockRevokeWhere });

            const createdToken = await refreshTokenRepository.create(mockUserId);
            const foundToken = await refreshTokenRepository.findByToken(mockToken);
            const rotatedToken = await refreshTokenRepository.rotate(createdToken);
            await refreshTokenRepository.revoke(rotatedToken.id);

            expect(createdToken.user_id).toBe(mockUserId);
            expect(foundToken?.token).toBe(mockToken);
            expect(rotatedToken.token).toBe(mockNewToken);
            expect(mockRevokeUpdate).toHaveBeenCalledWith({ revoked: true });
        });
    });
});