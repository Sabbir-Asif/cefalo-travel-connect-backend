import { EmailVerificationService } from "../../src/services/email-verification";
import { IEmailVerificationRepository } from "../../src/repositories/email-verification";
import { IUserRepository } from "../../src/repositories/user";
import { sendVerificationEmail } from "../../src/utils/mailer";
import { Role, User, UserResponse } from "../../src/interfaces/user";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { NotFoundException } from "../../src/exceptions/not-found";
import { ErrorCode } from "../../src/exceptions/root";
import { UserResponseDto } from "../../src/dtos/user";
import { UUID } from "crypto";

jest.mock("../../src/utils/mailer", () => ({
    sendVerificationEmail: jest.fn(),
}));

const mockEmailVerificationRepo: jest.Mocked<IEmailVerificationRepository> = {
    create: jest.fn(),
    findByToken: jest.fn(),
    deleteByToken: jest.fn(),
    deleteExpired: jest.fn(),
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findAllUsers: jest.fn(),
    findByEmail: jest.fn(),
    findByPhoneNumber: jest.fn(),
    search: jest.fn(),
};

const now = new Date();
const user: User = {
    id: "user-1" as any,
    name: "Test User",
    email: "test@example.com",
    password: "hashed",
    role: Role.EXPLORER,
    phone_number: "1234567890",
    displayPicture: null,
    bio: null,
    is_verified: false,
    createdAt: now,
    updatedAt: now,
};

describe("EmailVerificationService", () => {
    const service = new EmailVerificationService(mockEmailVerificationRepo, mockUserRepository);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("initiateVerification", () => {
        it("should generate token, store it, and send email", async () => {
            await service.initiateVerification(user.id, user.email, user.name);

            expect(mockEmailVerificationRepo.create).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.any(Date)
            );

            expect(sendVerificationEmail).toHaveBeenCalledWith(
                user.email,
                user.name,
                expect.any(String)
            );
        });
    });

    describe("verifyEmail", () => {
        const token = "valid-token";

        it("should verify and return the updated user if token is valid", async () => {
            const verification = {
                id: "verification-id-1" as UUID,
                user_id: user.id as UUID,
                token,
                expires_at: new Date(Date.now() + 10 * 60 * 1000),
                created_at: new Date(),
            };

            mockEmailVerificationRepo.findByToken.mockResolvedValue(verification);
            mockUserRepository.findById.mockResolvedValue(user);
            mockUserRepository.update.mockResolvedValue({ ...user, is_verified: true });

            const result = await service.verifyEmail(token);

            expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, { is_verified: true });
            expect(mockEmailVerificationRepo.deleteByToken).toHaveBeenCalledWith(token);
            expect(result).toBeInstanceOf(UserResponseDto);
        });

        it("should throw BadRequestException if token is expired", async () => {
            const expiredVerification = {
                id: "verification-id-2" as UUID,
                user_id: user.id,
                token,
                expires_at: new Date(Date.now() - 10 * 60 * 1000),
                created_at: new Date(),
            };

            mockEmailVerificationRepo.findByToken.mockResolvedValue(expiredVerification);

            await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
        });

        it("should throw BadRequestException if token is not found", async () => {
            mockEmailVerificationRepo.findByToken.mockResolvedValue(null);

            await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
        });

        it("should throw NotFoundException if user is not found", async () => {
            const verification = {
                id: "verification-id-3" as UUID,
                user_id: user.id,
                token,
                expires_at: new Date(Date.now() + 10 * 60 * 1000),
                created_at: new Date(),
            };

            mockEmailVerificationRepo.findByToken.mockResolvedValue(verification);
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.verifyEmail(token)).rejects.toThrow(NotFoundException);
        });

        it("should throw BadRequestException if user is already verified", async () => {
            const verification = {
                id: "verification-id-4" as UUID,
                user_id: user.id,
                token,
                expires_at: new Date(Date.now() + 10 * 60 * 1000),
                created_at: new Date(),
            };

            mockEmailVerificationRepo.findByToken.mockResolvedValue(verification);
            mockUserRepository.findById.mockResolvedValue({ ...user, is_verified: true });

            await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
        });
    });


    describe("cleanupExpired", () => {
        it("should call deleteExpired and return the result", async () => {
            mockEmailVerificationRepo.deleteExpired.mockResolvedValue(3);

            const result = await service.cleanupExpired();
            expect(result).toBe(3);
            expect(mockEmailVerificationRepo.deleteExpired).toHaveBeenCalled();
        });
    });
});
