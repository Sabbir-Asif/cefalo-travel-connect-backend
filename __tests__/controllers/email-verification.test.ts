import {
    initiateVerification,
    verifyEmail,
    __setEmailVerificationService
} from "../../src/controllers/email-verification";
import { EmailVerificationService } from "../../src/services/email-verification";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";

describe("EmailVerification Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockService: jest.Mocked<EmailVerificationService>;

    const userId = "25d7d803-d63a-4892-bc90-c4635b3f1681" as UUID;

    beforeEach(() => {
        req = { body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        mockService = {
            initiateVerification: jest.fn(),
            verifyEmail: jest.fn()
        } as unknown as jest.Mocked<EmailVerificationService>;

        __setEmailVerificationService(mockService);
        jest.clearAllMocks();
    });

    describe("initiateVerification", () => {
        it("should call service and return 200", async () => {
            req.body = {
                userId,
                email: "test@example.com",
                name: "Tester"
            };

            await initiateVerification(req as Request, res as Response);

            expect(mockService.initiateVerification).toHaveBeenCalledWith(userId, "test@example.com", "Tester");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Verification email sent" });
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.body = { foo: "bar" };

            await expect(initiateVerification(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
            expect(mockService.initiateVerification).not.toHaveBeenCalled();
        });

        it("should throw UnprocessableEntityException if userId is missing", async () => {
            req.body = { email: "test@example.com", name: "Tester" };

            await expect(initiateVerification(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
            expect(mockService.initiateVerification).not.toHaveBeenCalled();
        });
    });

    describe("verifyEmail", () => {
        it("should verify email and return success HTML", async () => {
            req.query = { token: "abc123" };

            await verifyEmail(req as Request, res as Response);

            expect(mockService.verifyEmail).toHaveBeenCalledWith("abc123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.stringContaining("Email Verified Successfully"));
        });

        it("should return failure HTML if service throws", async () => {
            req.query = { token: "bad-token" };
            mockService.verifyEmail.mockRejectedValue(new Error("Invalid or expired token"));

            await verifyEmail(req as Request, res as Response);

            expect(mockService.verifyEmail).toHaveBeenCalledWith("bad-token");
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith(expect.stringContaining("Verification Failed"));
            expect(res.send).toHaveBeenCalledWith(expect.stringContaining("Invalid or expired token"));
        });

        it("should throw BadRequestException for missing token", async () => {
            req.query = {};

            await expect(verifyEmail(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });

        it("should throw BadRequestException for non-string token", async () => {
            req.query = { token: 123 as unknown as string };

            await expect(verifyEmail(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });
});
