import { PasswordResetService } from "../../src/services/password-reset";
import { IPasswordResetRepository } from "../../src/repositories/password-reset";
import { IUserRepository } from "../../src/repositories/user";
import { sendPasswordResetEmail } from "../../src/utils/mailer";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { NotFoundException } from "../../src/exceptions/not-found";
import { UUID } from "crypto";
import { PasswordReset } from "../../src/interfaces/password-reset";
import { User, Role } from "../../src/interfaces/user";

jest.mock("../../src/utils/mailer", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

const mockPasswordResetRepo: jest.Mocked<IPasswordResetRepository> = {
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByToken: jest.fn(),
  deleteExpired: jest.fn(),
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findByPhoneNumber: jest.fn(),
  findById: jest.fn(),
  findAllUsers: jest.fn(),
  search: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const now = new Date();
const user: User = {
  id: "user-uuid" as UUID,
  name: "Sabbir",
  email: "sabbir@test.com",
  password: "old-hash",
  role: Role.EXPLORER,
  phone_number: "1234567890",
  displayPicture: null,
  bio: null,
  is_verified: true,
  createdAt: now,
  updatedAt: now,
};

describe("PasswordResetService", () => {
  const service = new PasswordResetService(mockPasswordResetRepo, mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initiateReset", () => {
    it("should create reset token and send email", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(user);

      await service.initiateReset(user.email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email);
      expect(mockPasswordResetRepo.create).toHaveBeenCalledWith({
        user_id: user.id,
        token: expect.any(String),
        expires_at: expect.any(Date),
      });
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(user.email, user.name, expect.any(String));
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.initiateReset("notfound@example.com")).rejects.toThrow(NotFoundException);
    });
  });

  describe("resetPassword", () => {
    const token = "reset-token";

    const validReset: PasswordReset = {
      id: "reset-id" as UUID,
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      created_at: now,
    };

    it("should reset password and delete token", async () => {
      mockPasswordResetRepo.findByToken.mockResolvedValue(validReset);
      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue({ ...user, password: "hashed-password" });

      await service.resetPassword(token, "newPass123");

      expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, { password: "hashed-password" });
      expect(mockPasswordResetRepo.deleteByToken).toHaveBeenCalledWith(token);
    });

    it("should throw BadRequestException if token not found", async () => {
      mockPasswordResetRepo.findByToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, "pass")).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if token expired", async () => {
      const expiredReset = { ...validReset, expires_at: new Date(Date.now() - 1000) };
      mockPasswordResetRepo.findByToken.mockResolvedValue(expiredReset);

      await expect(service.resetPassword(token, "pass")).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockPasswordResetRepo.findByToken.mockResolvedValue(validReset);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.resetPassword(token, "pass")).rejects.toThrow(NotFoundException);
    });
  });

  describe("cleanupExpired", () => {
    it("should call deleteExpired and return count", async () => {
      mockPasswordResetRepo.deleteExpired.mockResolvedValue(2);

      const result = await service.cleanupExpired();

      expect(mockPasswordResetRepo.deleteExpired).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });
});
