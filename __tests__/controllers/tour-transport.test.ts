import {
    createTourTransport,
    getAllTourTransports,
    getTourTransportById,
    updateTourTransport,
    deleteTourTransport,
    searchTourTransports,
    __setTourTransportService,
} from "../../src/controllers/tour-transport";
import { TourTransportService } from "../../src/services/tour-transport";
import { Request, Response } from "express";
import { UUID } from "crypto";
import {
    UnprocessableEntityException,
} from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { Role, User } from "../../src/interfaces/user";
import { TransportType } from "../../src/interfaces/transport";

describe("TourTransportController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTourTransportService: jest.Mocked<TourTransportService>;

    const userId = "123e4567-e89b-12d3-a456-426614174000" as UUID;
    const tourTransportId = "223e4567-e89b-12d3-a456-426614174001" as UUID;

    const fullMockTourTransport = {
        id: tourTransportId,
        travelplan_id: tourTransportId,
        transport_id: tourTransportId,
        departure_time: new Date(),
        contact_number: "0123456789",
        created_at: new Date(),
        updated_at: new Date(),
        transport: {
            id: tourTransportId,
            type: TransportType.BUS,
            name: "Bus 123",
            starting_location: "City A",
            starting_point: { lat: 10, long: 20 },
            destination: "City B",
            destination_point: { lat: 15, long: 25 },
            departure_time: new Date(),
            arrival_time: new Date(),
            fare: "100",
            created_at: new Date(),
            updated_at: new Date(),
        }
    };

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: {
                id: userId,
                name: "Tester",
                email: "tester@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "01700000000",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockTourTransportService = {
            create: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            search: jest.fn(),
        } as unknown as jest.Mocked<TourTransportService>;

        __setTourTransportService(mockTourTransportService);
        jest.clearAllMocks();
    });

    describe("createTourTransport", () => {
        it("should create tour transport and return 201", async () => {
            req.body = {
                travelplan_id: tourTransportId,
                transport_id: tourTransportId,
                departure_time: new Date(),
                contact_number: "0123456789",
            };

            mockTourTransportService.create.mockResolvedValue(fullMockTourTransport);

            await createTourTransport(req as Request, res as Response);

            expect(mockTourTransportService.create).toHaveBeenCalledWith(userId, expect.objectContaining(req.body));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fullMockTourTransport);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.body = { invalid: "data" };

            await expect(createTourTransport(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.user = { id: "invalid-uuid-0000-0000-000000000000" } as unknown as User;

            req.body = {
                travelplan_id: tourTransportId,
                transport_id: tourTransportId,
                departure_time: new Date(),
                contact_number: "0123456789",
            };

            await expect(createTourTransport(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("getAllTourTransports", () => {
        it("should return all tour transports with 200", async () => {
            mockTourTransportService.getAll.mockResolvedValue([fullMockTourTransport]);

            await getAllTourTransports(req as Request, res as Response);

            expect(mockTourTransportService.getAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([fullMockTourTransport]);
        });
    });

    describe("getTourTransportById", () => {
        it("should return a tour transport by id", async () => {
            req.params = { id: tourTransportId };
            mockTourTransportService.getById.mockResolvedValue(fullMockTourTransport);

            await getTourTransportById(req as Request, res as Response);

            expect(mockTourTransportService.getById).toHaveBeenCalledWith(tourTransportId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fullMockTourTransport);
        });

        it("should throw BadRequestException if id invalid", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(getTourTransportById(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe("updateTourTransport", () => {
        it("should update and return updated tour transport", async () => {
            req.params = { id: tourTransportId };
            req.body = { contact_number: "0987654321" };

            mockTourTransportService.update.mockResolvedValue(fullMockTourTransport);

            await updateTourTransport(req as Request, res as Response);

            expect(mockTourTransportService.update).toHaveBeenCalledWith(tourTransportId, userId, expect.objectContaining(req.body));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fullMockTourTransport);
        });

        it("should throw BadRequestException if id invalid", async () => {
            req.params = { id: "invalid-uuid" };
            req.body = { contact_number: "0987654321" };

            await expect(updateTourTransport(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw UnprocessableEntityException if body invalid", async () => {
            req.params = { id: tourTransportId };
            req.body = { contact_number: 1234 }; // wrong type

            await expect(updateTourTransport(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.params = { id: tourTransportId };
            req.body = { contact_number: "0987654321" };
            req.user = {
                id: "invalid-uuid-0000-0000-000000000000",
                name: "Tester",
                email: "tester@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "01700000000",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await expect(updateTourTransport(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("deleteTourTransport", () => {
        it("should delete tour transport and return 204", async () => {
            req.params = { id: tourTransportId };

            mockTourTransportService.delete.mockResolvedValue(undefined);

            await deleteTourTransport(req as Request, res as Response);

            expect(mockTourTransportService.delete).toHaveBeenCalledWith(tourTransportId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw BadRequestException if id invalid", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(deleteTourTransport(req as Request, res as Response))
                .rejects.toThrow(BadRequestException);
        });

        it("should throw UnauthorizedException if user id invalid", async () => {
            req.params = { id: tourTransportId };
            req.user = {
                id: "invalid-uuid-0000-0000-000000000000",
                name: "Tester",
                email: "tester@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "01700000000",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await expect(deleteTourTransport(req as Request, res as Response))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe("searchTourTransports", () => {
        it("should return search results", async () => {
            req.query = { travelplan_id: tourTransportId };
            mockTourTransportService.search.mockResolvedValue([fullMockTourTransport]);

            await searchTourTransports(req as Request, res as Response);

            expect(mockTourTransportService.search).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([fullMockTourTransport]);
        });
    });
});
