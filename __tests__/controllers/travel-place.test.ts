import {
    createTravelPlace,
    getAllTravelPlace,
    getTravelPlaceById,
    updateTravelPlace,
    deleteTravelPlace,
    searchTravelPlaces,
    __setTravelPlaceService,
} from "../../src/controllers/travel-place";

import { TravelPlaceService } from "../../src/services/travel-place";
import { Request, Response } from "express";
import { UUID } from "crypto";
import {
    UnprocessableEntityException,
} from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { Role } from "../../src/interfaces/user";

describe("TravelPlaceController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTravelPlaceService: jest.Mocked<TravelPlaceService>;

    const userId = "123e4567-e89b-12d3-a456-426614174000" as UUID;
    const travelPlaceId = "223e4567-e89b-12d3-a456-426614174001" as UUID;

    const fullMockTravelPlace = {
        id: travelPlaceId,
        user_id: userId,
        name: "Beach Resort",
        location_name: "Miami",
        location_point: { lat: 25.7617, long: -80.1918 },
        cover_image: "https://example.com/image.jpg",
        description: "Beautiful beach resort",
        tags: ["beach", "resort"],
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

        mockTravelPlaceService = {
            createTravelPlace: jest.fn(),
            getAllTravelPlaces: jest.fn(),
            getTravelPlaceById: jest.fn(),
            updateTravelPlace: jest.fn(),
            deleteTravelPlace: jest.fn(),
            searchTravelPlaces: jest.fn(),
        } as unknown as jest.Mocked<TravelPlaceService>;

        __setTravelPlaceService(mockTravelPlaceService);
        jest.clearAllMocks();
    });

    describe("createTravelPlace", () => {
        it("should create a travel place and respond with 201", async () => {
            req.body = {
                name: "Beach Resort",
                location_name: "Miami",
                location_point: { lat: 25.7617, long: -80.1918 },
                cover_image: "https://example.com/image.jpg",
                description: "Beautiful beach resort",
                tags: ["beach", "resort"],
            };

            mockTravelPlaceService.createTravelPlace.mockResolvedValue(fullMockTravelPlace);

            await createTravelPlace(req as Request, res as Response);

            expect(mockTravelPlaceService.createTravelPlace).toHaveBeenCalledWith(
                userId,
                expect.objectContaining(req.body)
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fullMockTravelPlace);
        });

        it("should throw UnprocessableEntityException if body validation fails", async () => {
            req.body = { invalid: "data" };

            await expect(createTravelPlace(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw UnauthorizedException if user id is invalid", async () => {
            req.user = { id: "invalid-uuid" } as any;
            req.body = {
                name: "Beach Resort",
                location_name: "Miami",
                location_point: { lat: 25.7617, long: -80.1918 },
            };

            await expect(createTravelPlace(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("getAllTravelPlace", () => {
        it("should return all travel places with status 200", async () => {
            mockTravelPlaceService.getAllTravelPlaces.mockResolvedValue([fullMockTravelPlace]);

            await getAllTravelPlace(req as Request, res as Response);

            expect(mockTravelPlaceService.getAllTravelPlaces).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([fullMockTravelPlace]);
        });
    });

    describe("getTravelPlaceById", () => {
        it("should return travel place by id", async () => {
            req.params = { id: travelPlaceId };
            mockTravelPlaceService.getTravelPlaceById.mockResolvedValue(fullMockTravelPlace);

            await getTravelPlaceById(req as Request, res as Response);

            expect(mockTravelPlaceService.getTravelPlaceById).toHaveBeenCalledWith(travelPlaceId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fullMockTravelPlace);
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(getTravelPlaceById(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe("updateTravelPlace", () => {
        it("should update travel place and return updated entity", async () => {
            req.params = { id: travelPlaceId };
            req.body = { description: "Updated description" };

            mockTravelPlaceService.updateTravelPlace.mockResolvedValue(fullMockTravelPlace);

            await updateTravelPlace(req as Request, res as Response);

            expect(mockTravelPlaceService.updateTravelPlace).toHaveBeenCalledWith(
                travelPlaceId,
                userId,
                expect.objectContaining(req.body)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fullMockTravelPlace);
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid-uuid" };
            req.body = { description: "Updated description" };

            await expect(updateTravelPlace(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.params = { id: travelPlaceId };
            req.body = { description: 1234 }; // wrong type

            await expect(updateTravelPlace(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.params = { id: travelPlaceId };
            req.body = { description: "Updated description" };
            req.user = { id: "invalid-uuid" } as any;

            await expect(updateTravelPlace(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("deleteTravelPlace", () => {
        it("should delete travel place and return 204", async () => {
            req.params = { id: travelPlaceId };

            mockTravelPlaceService.deleteTravelPlace.mockResolvedValue();

            await deleteTravelPlace(req as Request, res as Response);

            expect(mockTravelPlaceService.deleteTravelPlace).toHaveBeenCalledWith(travelPlaceId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(deleteTravelPlace(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.params = { id: travelPlaceId };
            req.user = { id: "invalid-uuid" } as any;

            await expect(deleteTravelPlace(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("searchTravelPlaces", () => {
        it("should return search results with status 200", async () => {
            req.query = { name: "Beach" };
            mockTravelPlaceService.searchTravelPlaces.mockResolvedValue([fullMockTravelPlace]);

            await searchTravelPlaces(req as Request, res as Response);

            expect(mockTravelPlaceService.searchTravelPlaces).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([fullMockTravelPlace]);
        });
    });
});
