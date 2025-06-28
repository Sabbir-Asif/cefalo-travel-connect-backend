import {
    createTravelRequest,
    getAllTravelRequests,
    getTravelRequestById,
    updateTravelRequest,
    deleteTravelRequest,
    searchTravelRequests,
    __setTravelRequestService,
} from "../../src/controllers/travel-request";

import { TravelRequestService } from "../../src/services/travel-request";
import { Request, Response } from "express";
import { UUID } from "crypto";
import {
    UnprocessableEntityException,
} from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { TravelRequestStatus } from "../../src/interfaces/travel-request";
import { Role } from "../../src/interfaces/user";

describe("TravelRequestController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockService: jest.Mocked<TravelRequestService>;

    const userId = "123e4567-e89b-12d3-a456-426614174000" as UUID;
    const travelRequestId = "223e4567-e89b-12d3-a456-426614174001" as UUID;

    const mockTravelRequest = {
        id: travelRequestId,
        travel_plan_id: "123e4567-e89b-12d3-a456-426614174111" as UUID,
        user_from: userId,
        user_to: "123e4567-e89b-12d3-a456-426614174222" as UUID,
        title: "Request to join",
        message: "Can I join?",
        status: TravelRequestStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: {
                id: userId,
                name: "Bob",
                email: "bob@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "01800000000",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockService = {
            createTravelRequest: jest.fn(),
            getAllTravelRequests: jest.fn(),
            getTravelRequestById: jest.fn(),
            updateTravelRequest: jest.fn(),
            deleteTravelRequest: jest.fn(),
            searchTravelRequests: jest.fn(),
        } as unknown as jest.Mocked<TravelRequestService>;

        __setTravelRequestService(mockService);
        jest.clearAllMocks();
    });

    describe("createTravelRequest", () => {
        it("should create request and return 201", async () => {
            req.body = {
                travel_plan_id: "123e4567-e89b-12d3-a456-426614174111" as UUID,
                user_to: "123e4567-e89b-12d3-a456-426614174222" as UUID,
                title: "Request to join",
                message: "Can I join?",
            };

            mockService.createTravelRequest.mockResolvedValue(mockTravelRequest);

            await createTravelRequest(req as Request, res as Response);

            expect(mockService.createTravelRequest).toHaveBeenCalledWith(
                userId,
                expect.objectContaining(req.body)
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTravelRequest);
        });

        it("should throw for invalid body", async () => {
            req.body = { invalid: "data" };

            await expect(createTravelRequest(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw for invalid user id", async () => {
            req.user = { id: "invalid-uuid" } as any;
            req.body = {
                travel_plan_id: "123e4567-e89b-12d3-a456-426614174111" as UUID,
                user_to: "123e4567-e89b-12d3-a456-426614174222" as UUID,
                title: "Request to join",
                message: "Can I join?",
            };

            await expect(createTravelRequest(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("getAllTravelRequests", () => {
        it("should return all requests", async () => {
            mockService.getAllTravelRequests.mockResolvedValue([mockTravelRequest]);

            await getAllTravelRequests(req as Request, res as Response);

            expect(mockService.getAllTravelRequests).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([mockTravelRequest]);
        });
    });

    describe("getTravelRequestById", () => {
        it("should return request by id", async () => {
            req.params = { id: travelRequestId };
            mockService.getTravelRequestById.mockResolvedValue(mockTravelRequest);

            await getTravelRequestById(req as Request, res as Response);

            expect(mockService.getTravelRequestById).toHaveBeenCalledWith(travelRequestId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTravelRequest);
        });

        it("should throw for invalid id", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(getTravelRequestById(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe("updateTravelRequest", () => {
        it("should update request", async () => {
            req.params = { id: travelRequestId };
            req.body = { title: "New title" };

            mockService.updateTravelRequest.mockResolvedValue(mockTravelRequest);

            await updateTravelRequest(req as Request, res as Response);

            expect(mockService.updateTravelRequest).toHaveBeenCalledWith(
                travelRequestId,
                userId,
                expect.objectContaining(req.body)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTravelRequest);
        });

        it("should throw for invalid id", async () => {
            req.params = { id: "invalid-uuid" };
            req.body = { title: "Update" };

            await expect(updateTravelRequest(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw for invalid body", async () => {
            req.params = { id: travelRequestId };
            req.body = { status: "WRONG_STATUS" };

            await expect(updateTravelRequest(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw for invalid user", async () => {
            req.params = { id: travelRequestId };
            req.body = { title: "Update" };
            req.user = { id: "invalid-uuid" } as any;

            await expect(updateTravelRequest(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("deleteTravelRequest", () => {
        it("should delete request", async () => {
            req.params = { id: travelRequestId };
            mockService.deleteTravelRequest.mockResolvedValue();

            await deleteTravelRequest(req as Request, res as Response);

            expect(mockService.deleteTravelRequest).toHaveBeenCalledWith(travelRequestId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw for invalid id", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(deleteTravelRequest(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw for invalid user id", async () => {
            req.params = { id: travelRequestId };
            req.user = { id: "invalid-uuid" } as any;

            await expect(deleteTravelRequest(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("searchTravelRequests", () => {
        it("should search requests", async () => {
            req.query = { title: "Request" };
            mockService.searchTravelRequests.mockResolvedValue([mockTravelRequest]);

            await searchTravelRequests(req as Request, res as Response);

            expect(mockService.searchTravelRequests).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([mockTravelRequest]);
        });
    });
});
