import { RefreshTokenService } from "../../src/services/refresh-token";
import { IRefreshTokenRepository } from "../../src/repositories/refresh-token";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { UUID } from "crypto";
import { RefreshToken } from "../../src/interfaces/token";

const mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository> = {
  create: jest.fn(),
  findByToken: jest.fn(),
  revoke: jest.fn(),
  rotate: jest.fn(),
};

describe("RefreshTokenService", () => {
  let service: RefreshTokenService;
  const userId = "11111111-1111-1111-1111-111111111111" as UUID;
  const tokenId = "22222222-2222-2222-2222-222222222222" as UUID;

  const validRefreshToken: RefreshToken = {
    id: tokenId,
    token: tokenId,
    user_id: userId,
    revoked: false,
    expires_at: new Date(Date.now() + 10000),
    created_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RefreshTokenService(mockRefreshTokenRepository);
  });

  describe("issue", () => {
    it("should call repository create and return new refresh token", async () => {
      mockRefreshTokenRepository.create.mockResolvedValue(validRefreshToken);

      const result = await service.issue(userId);

      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(userId);
      expect(result).toBe(validRefreshToken);
    });
  });

  describe("verifyAndRotate", () => {
    it("should throw UnauthorizedException if token not found", async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(service.verifyAndRotate(tokenId)).rejects.toThrow(UnauthorizedException);
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(tokenId);
    });

    it("should throw UnauthorizedException if token is revoked", async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        ...validRefreshToken,
        revoked: true,
      });

      await expect(service.verifyAndRotate(tokenId)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if token is expired", async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        ...validRefreshToken,
        expires_at: new Date(Date.now() - 1000),
      });

      await expect(service.verifyAndRotate(tokenId)).rejects.toThrow(UnauthorizedException);
    });

    it("should call rotate and return new token if valid", async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(validRefreshToken);
      const rotatedToken = { ...validRefreshToken, id: "33333333-3333-3333-3333-333333333333" as UUID };
      mockRefreshTokenRepository.rotate.mockResolvedValue(rotatedToken);

      const result = await service.verifyAndRotate(tokenId);

      expect(mockRefreshTokenRepository.rotate).toHaveBeenCalledWith(validRefreshToken);
      expect(result).toBe(rotatedToken);
    });
  });

  describe("revoke", () => {
    it("should call repository revoke with tokenId", async () => {
      mockRefreshTokenRepository.revoke.mockResolvedValue();

      await service.revoke(tokenId);

      expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(tokenId);
    });
  });
});
