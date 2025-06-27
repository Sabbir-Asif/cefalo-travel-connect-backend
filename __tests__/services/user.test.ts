import { UUID } from "crypto";
import { UserService } from "../../src/services/user";
import { IUserRepository } from "../../src/repositories/user";
import { UserResponseDto } from "../../src/dtos/user";
import { Role, User, UpdateUser } from "../../src/interfaces/user";
import { NotFoundException } from "../../src/exceptions/not-found";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { InternalException } from "../../src/exceptions/internal-exception";
import { ErrorCode } from "../../src/exceptions/root";

const mockUserRepository = {
    findById: jest.fn(),
    findByPhoneNumber: jest.fn(),
    findAllUsers: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    findByEmail: jest.fn(),
    search: jest.fn(),
};

describe("UserService", () => {
    const userService = new UserService(mockUserRepository);

    const sampleUser: User = {
        id: "123e4567-e89b-12d3-a456-426614174000" as unknown as UUID,
        name: "Test User",
        email: "test@example.com",
        password: "hashedpass",
        role: Role.ADMIN,
        displayPicture: null,
        bio: null,
        phone_number: "1234567890",
        is_verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getAllUsers", () => {
        it("returns array of UserResponseDto", async () => {
            mockUserRepository.findAllUsers.mockResolvedValue([sampleUser]);

            const result = await userService.getAllUsers();

            expect(mockUserRepository.findAllUsers).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(UserResponseDto);
            expect(result[0].id).toBe(sampleUser.id);
        });
    });

    describe("getUserById", () => {
        it("returns UserResponseDto when user found", async () => {
            mockUserRepository.findById.mockResolvedValue(sampleUser);

            const result = await userService.getUserById(sampleUser.id);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(sampleUser.id);
            expect(result).toBeInstanceOf(UserResponseDto);
            expect(result.id).toBe(sampleUser.id);
        });

        it("throws NotFoundException if user not found (getUserById)", async () => {
            mockUserRepository.findById.mockResolvedValue(null);
            await expect(userService.getUserById(sampleUser.id)).rejects.toThrow(NotFoundException);
        });
    });

    describe("updateUser", () => {
        const updateData: UpdateUser = {
            name: "Updated Name",
            phone_number: "9876543210",
        };

        it("updates and returns UserResponseDto when valid", async () => {
            mockUserRepository.findById.mockResolvedValue(sampleUser);
            mockUserRepository.findByPhoneNumber.mockResolvedValue(null);
            mockUserRepository.update.mockResolvedValue({ ...sampleUser, ...updateData });

            const result = await userService.updateUser(sampleUser.id, updateData);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(sampleUser.id);
            expect(mockUserRepository.findByPhoneNumber).toHaveBeenCalledWith(updateData.phone_number);
            expect(mockUserRepository.update).toHaveBeenCalledWith(sampleUser.id, updateData);
            expect(result).toBeInstanceOf(UserResponseDto);
            expect(result.name).toBe(updateData.name);
            expect(result.phone_number).toBe(updateData.phone_number);
        });

        it("throws NotFoundException if user to update not found", async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(userService.updateUser(sampleUser.id, updateData)).rejects.toThrow(NotFoundException);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(sampleUser.id);
        });

        it("throws BadRequestException if phone number exists on another user", async () => {
            const anotherUser: User = { ...sampleUser, id: "other-user-id" as any };
            mockUserRepository.findById.mockResolvedValue(sampleUser);
            mockUserRepository.findByPhoneNumber.mockResolvedValue(anotherUser);

            await expect(userService.updateUser(sampleUser.id, updateData)).rejects.toThrow(BadRequestException);

            expect(mockUserRepository.findByPhoneNumber).toHaveBeenCalledWith(updateData.phone_number);
        });

        it("throws InternalException if update returns null", async () => {
            mockUserRepository.findById.mockResolvedValue(sampleUser);
            mockUserRepository.findByPhoneNumber.mockResolvedValue(null);
            mockUserRepository.update.mockResolvedValue(null);

            await expect(userService.updateUser(sampleUser.id, updateData)).rejects.toThrow(InternalException);
        });
    });

    describe("deleteUser", () => {
        it("deletes user if found", async () => {
            mockUserRepository.findById.mockResolvedValue(sampleUser);
            mockUserRepository.delete.mockResolvedValue(sampleUser.id);

            await userService.deleteUser(sampleUser.id);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(sampleUser.id);
            expect(mockUserRepository.delete).toHaveBeenCalledWith(sampleUser.id);
        });

        it("throws NotFoundException if user not found", async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(userService.deleteUser(sampleUser.id)).rejects.toThrow(NotFoundException);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(sampleUser.id);
            expect(mockUserRepository.delete).not.toHaveBeenCalled();
        });
    });
});
