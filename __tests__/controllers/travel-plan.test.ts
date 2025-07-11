import {
    createTravelPlan,
    getAllTravelPlans,
    getTravelPlanById,
    updateTravelPlan,
    deleteTravelPlan,
    searchTravelPlans,
    __setTravelPlanService,
} from "../../src/controllers/travel-plan";

import { TravelPlanService } from "../../src/services/travel-plan";
import { Request, Response } from "express";
import { UUID } from "crypto";
import {
    UnprocessableEntityException,
} from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { TravelPlanStatus } from "../../src/interfaces/travel-plan";
import { Role } from "../../src/interfaces/user";

describe("TravelPlanController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTravelPlanService: jest.Mocked<TravelPlanService>;

    const userId = "123e4567-e89b-12d3-a456-426614174000" as UUID;
    const travelPlanId = "223e4567-e89b-12d3-a456-426614174001" as UUID;

    const fullMockTravelPlan = {
        id: travelPlanId,
        planner_id: userId,
        title: "Summer Trip",
        starting_point_name: "City A",
        starting_point_location: { lat: 10, long: 20 },
        destination_name: "City B",
        destination_location: { lat: 15, long: 25 },
        starting_date: new Date("2024-07-01"),
        ending_date: new Date("2024-07-10"),
        budget: 2000,
        description: "A nice summer trip",
        status: TravelPlanStatus.PENDING,
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
                name: "Alice",
                email: "alice@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "01700000000",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockTravelPlanService = {
            createTravelPlan: jest.fn(),
            getAllTravelPlans: jest.fn(),
            getTravelPlanById: jest.fn(),
            updateTravelPlan: jest.fn(),
            deleteTravelPlan: jest.fn(),
            searchTravelPlans: jest.fn(),
        } as unknown as jest.Mocked<TravelPlanService>;

        __setTravelPlanService(mockTravelPlanService);
        jest.clearAllMocks();
    });

    describe("createTravelPlan", () => {
        it("should create travel plan and return 201", async () => {
            req.body = {
                title: "Summer Trip",
                starting_point_name: "City A",
                starting_point_location: { lat: 10, long: 20 },
                destination_name: "City B",
                destination_location: { lat: 15, long: 25 },
                starting_date: "2024-07-01",
                ending_date: "2024-07-10",
                budget: 2000,
                description: "A nice summer trip",
                status: TravelPlanStatus.PENDING,
            };

            mockTravelPlanService.createTravelPlan.mockResolvedValue(fullMockTravelPlan);

            await createTravelPlan(req as Request, res as Response);

            expect(mockTravelPlanService.createTravelPlan).toHaveBeenCalledWith(
                userId,
                expect.objectContaining({
                    title: req.body.title,
                    starting_point_name: req.body.starting_point_name,
                    starting_point_location: req.body.starting_point_location,
                    destination_name: req.body.destination_name,
                    destination_location: req.body.destination_location,
                    starting_date: new Date(req.body.starting_date),
                    ending_date: new Date(req.body.ending_date),
                    budget: req.body.budget,
                    description: req.body.description,
                    status: req.body.status,
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fullMockTravelPlan);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.body = { invalid: "data" };

            await expect(createTravelPlan(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.user = { id: "invalid-uuid" } as any;
            req.body = {
                title: "Summer Trip",
                starting_point_name: "City A",
                starting_point_location: { lat: 10, long: 20 },
                destination_name: "City B",
                destination_location: { lat: 15, long: 25 },
                starting_date: "2024-07-01",
                ending_date: "2024-07-10",
                budget: 2000,
                description: "A nice summer trip",
            };

            await expect(createTravelPlan(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });


    describe("getAllTravelPlans", () => {
        it("should return all travel plans with status 200", async () => {
            mockTravelPlanService.getAllTravelPlans.mockResolvedValue([fullMockTravelPlan]);

            await getAllTravelPlans(req as Request, res as Response);

            expect(mockTravelPlanService.getAllTravelPlans).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([fullMockTravelPlan]);
        });
    });

    describe("getTravelPlanById", () => {
        it("should return travel plan by id", async () => {
            req.params = { id: travelPlanId };
            mockTravelPlanService.getTravelPlanById.mockResolvedValue(fullMockTravelPlan);

            await getTravelPlanById(req as Request, res as Response);

            expect(mockTravelPlanService.getTravelPlanById).toHaveBeenCalledWith(travelPlanId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fullMockTravelPlan);
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(getTravelPlanById(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe("updateTravelPlan", () => {
        it("should update travel plan and return updated entity", async () => {
            req.params = { id: travelPlanId };
            req.body = { description: "Updated description" };

            mockTravelPlanService.updateTravelPlan.mockResolvedValue(fullMockTravelPlan);

            await updateTravelPlan(req as Request, res as Response);

            expect(mockTravelPlanService.updateTravelPlan).toHaveBeenCalledWith(
                travelPlanId,
                userId,
                expect.objectContaining(req.body)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fullMockTravelPlan);
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid-uuid" };
            req.body = { description: "Updated description" };

            await expect(updateTravelPlan(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.params = { id: travelPlanId };
            req.body = { budget: "not-a-number" };

            await expect(updateTravelPlan(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.params = { id: travelPlanId };
            req.body = { description: "Updated description" };
            req.user = { id: "invalid-uuid" } as any;

            await expect(updateTravelPlan(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("deleteTravelPlan", () => {
        it("should delete travel plan and return 204", async () => {
            req.params = { id: travelPlanId };

            mockTravelPlanService.deleteTravelPlan.mockResolvedValue();

            await deleteTravelPlan(req as Request, res as Response);

            expect(mockTravelPlanService.deleteTravelPlan).toHaveBeenCalledWith(travelPlanId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(deleteTravelPlan(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.params = { id: travelPlanId };
            req.user = { id: "invalid-uuid" } as any;

            await expect(deleteTravelPlan(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("searchTravelPlans", () => {
        it("should return search results with status 200", async () => {
            req.query = { title: "Summer" };
            mockTravelPlanService.searchTravelPlans.mockResolvedValue([fullMockTravelPlan]);

            await searchTravelPlans(req as Request, res as Response);

            expect(mockTravelPlanService.searchTravelPlans).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([fullMockTravelPlan]);
        });
    });
});
