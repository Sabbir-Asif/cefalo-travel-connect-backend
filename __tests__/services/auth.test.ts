import * as bcrypt from "bcrypt";
import { IUserRepository } from "../../src/repositories/user";
import { CreateUser, Role, User } from "../../src/interfaces/user";
import { AuthService } from "../../src/services/auth";
import { emailVerificationService } from "../../src/controllers/email-verification";
import { UserResponseDto } from "../../src/dtos/user";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { InternalException } from "../../src/exceptions/internal-exception";
import { TokenService } from "../../src/services/token";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";

jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock("../../src/services/token", () => ({
    TokenService: {
        signAccessToken: jest.fn().mockReturnValue("mocked-token"),
    },
}));

jest.mock("../../src/controllers/email-verification", () => ({
    emailVerificationService: {
        initiateVerification: jest.fn(),
    },
}));

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
    id: "user-1" as any,
    name: "Test User",
    email: "test@example.com",
    password: "hashedpass",
    role: Role.TRAVELER,
    phone_number: "1234567890",
    displayPicture: null,
    bio: null,
    is_verified: true,
    createdAt: now,
    updatedAt: now,
};

describe("AuthService", () => {
    const authService = new AuthService(mockUserRepository);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("signup", () => {
        const createUserData: CreateUser = {
            name: "New User",
            email: "new@example.com",
            password: "newpass",
            phone_number: "9999999999",
        };

        it("signs up a new user successfully", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-newpass");

            mockUserRepository.create.mockResolvedValue({
                ...user,
                ...createUserData,
                password: "hashed-newpass",
                is_verified: false,
            });

            const result = await authService.signup(createUserData);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("new@example.com");
            expect(bcrypt.hash).toHaveBeenCalledWith("newpass", expect.any(Number));
            expect(mockUserRepository.create).toHaveBeenCalled();

            expect(emailVerificationService.initiateVerification).toHaveBeenCalledWith(
                expect.any(String),
                createUserData.email,
                createUserData.name
            );

            expect(result).toBeInstanceOf(UserResponseDto);
        });

        it("throws BadRequestException if user already exists", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(user);

            await expect(authService.signup(createUserData)).rejects.toThrow(BadRequestException);
        });

        it("throws InternalException if email verification fails", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
            mockUserRepository.create.mockResolvedValue({
                ...user,
                ...createUserData,
                is_verified: false,
            });
            (emailVerificationService.initiateVerification as jest.Mock).mockRejectedValueOnce(
                new Error("SMTP error")
            );

            await expect(authService.signup(createUserData)).rejects.toThrow(InternalException);
        });
    });

    describe("login", () => {
        it("logs in verified user successfully", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.login("test@example.com", "password");

            expect(result.token).toBe("mocked-token");
            expect(result.user).toBeInstanceOf(UserResponseDto);
            expect(TokenService.signAccessToken).toHaveBeenCalledWith(user.id);
        });

        it("throws UnauthorizedException if user not found", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(authService.login("notfound@example.com", "pass")).rejects.toThrow(
                UnauthorizedException
            );
        });

        it("throws UnauthorizedException if user not verified", async () => {
            mockUserRepository.findByEmail.mockResolvedValue({ ...user, is_verified: false });

            await expect(authService.login("test@example.com", "pass")).rejects.toThrow(
                UnauthorizedException
            );
        });

        it("throws UnauthorizedException if password is incorrect", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(authService.login("test@example.com", "wrongpass")).rejects.toThrow(
                UnauthorizedException
            );
        });
    });
});
