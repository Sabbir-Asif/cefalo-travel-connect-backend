import {
    requestPasswordReset,
    resetPassword,
    __setPasswordResetService
} from "../../src/controllers/password-reset";

import { PasswordResetService } from "../../src/services/password-reset";
import { Request, Response } from "express";
import { UnprocessableEntityException } from "../../src/exceptions/validation";

describe("PasswordResetController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockPasswordResetService: jest.Mocked<PasswordResetService>;

    beforeEach(() => {
        req = {
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockPasswordResetService = {
            initiateReset: jest.fn(),
            resetPassword: jest.fn()
        } as unknown as jest.Mocked<PasswordResetService>;

        __setPasswordResetService(mockPasswordResetService);
        jest.clearAllMocks();
    });

    describe("requestPasswordReset", () => {
        it("should call initiateReset and return 200", async () => {
            req.body = { email: "test@example.com" };

            await requestPasswordReset(req as Request, res as Response);

            expect(mockPasswordResetService.initiateReset).toHaveBeenCalledWith("test@example.com");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Password reset email sent" });
        });

        it("should throw UnprocessableEntityException on invalid input", async () => {
            req.body = { email: 123 }; // invalid email format

            await expect(requestPasswordReset(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockPasswordResetService.initiateReset).not.toHaveBeenCalled();
        });
    });

    describe("resetPassword", () => {
        it("should call resetPassword and return 200", async () => {
            req.body = { token: "valid-token", password: "NewP@ss123" };

            await resetPassword(req as Request, res as Response);

            expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith("valid-token", "NewP@ss123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Password reset successful" });
        });

        it("should throw UnprocessableEntityException on invalid body", async () => {
            req.body = { token: 123, password: true }; // both invalid

            await expect(resetPassword(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockPasswordResetService.resetPassword).not.toHaveBeenCalled();
        });
    });
});
