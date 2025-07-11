import { getUserById, getAllUsers, updateUser, deleteUser, __setUserService } from "../../src/controllers/user";
import { Request, Response } from "express";
import { Role, User } from "../../src/interfaces/user";
import { ErrorCode } from "../../src/exceptions/root";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { UserResponseDto } from "../../src/dtos/user";
import { UUID } from "crypto";

const validUUID = "3e5a695d-3175-40b7-ab81-a5f032794676";

const mockUser: User = {
    id: validUUID as UUID,
    name: "John Doe",
    email: "john@example.com",
    phone_number: "01700000000",
    role: Role.TRAVELER,
    displayPicture: null,
    bio: null,
    password: "hashed-password",
    is_verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const userResponseDto = new UserResponseDto(mockUser);

const mockUserService = {
    getUserById: jest.fn(),
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
};

describe("UserController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeAll(() => {
        __setUserService(mockUserService as any);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {},
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe("getUserById", () => {
        it("should return user for valid ID", async () => {
            req.params = { id: validUUID };
            mockUserService.getUserById.mockResolvedValueOnce(userResponseDto);

            await getUserById(req as Request, res as Response, next);

            expect(mockUserService.getUserById).toHaveBeenCalledWith(validUUID);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: validUUID }));
        });

        it("should throw BadRequest for invalid ID", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(getUserById(req as Request, res as Response, next)).rejects.toThrow(
                new BadRequestException("Invalid user id!", ErrorCode.INVALID_USER_ID)
            );
        });
    });

    describe("getAllUsers", () => {
        it("should return list of users", async () => {
            const userList = [userResponseDto];
            mockUserService.getAllUsers.mockResolvedValueOnce(userList);

            await getAllUsers(req as Request, res as Response, next);

            expect(mockUserService.getAllUsers).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(userList);
        });
    });

    describe("updateUser", () => {
        it("should update user on valid ID and body", async () => {
            req.params = { id: validUUID };
            req.body = { name: "Updated Name" };

            const updatedUser = new UserResponseDto({ ...mockUser, name: "Updated Name" });
            mockUserService.updateUser.mockResolvedValueOnce(updatedUser);

            await updateUser(req as Request, res as Response, next);

            expect(mockUserService.updateUser).toHaveBeenCalledWith(
                validUUID,
                expect.objectContaining({ name: "Updated Name" })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });

        it("should throw BadRequest for invalid ID", async () => {
            req.params = { id: "invalid" };
            req.body = { name: "Updated" };

            await expect(updateUser(req as Request, res as Response, next)).rejects.toThrow(
                new BadRequestException("Invalid user id!", ErrorCode.INVALID_USER_ID)
            );
        });

        it("should throw UnprocessableEntity for invalid body", async () => {
            req.params = { id: validUUID };
            req.body = { name: 123 }; // invalid body

            await expect(updateUser(req as Request, res as Response, next)).rejects.toThrow(
                UnprocessableEntityException
            );
        });
    });

    describe("deleteUser", () => {
        it("should delete user on valid ID", async () => {
            req.params = { id: validUUID };
            mockUserService.deleteUser.mockResolvedValueOnce(undefined);

            await deleteUser(req as Request, res as Response, next);

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(validUUID);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw BadRequest for invalid ID", async () => {
            req.params = { id: "bad-id" };

            await expect(deleteUser(req as Request, res as Response, next)).rejects.toThrow(
                new BadRequestException("Invalid user id", ErrorCode.INVALID_USER_ID)
            );
        });
    });
});
