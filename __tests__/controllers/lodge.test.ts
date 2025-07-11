import {
    createLodge,
    getAllLodges,
    getLodgeById,
    updateLodge,
    deleteLodge,
    getLodgeLocationNames,
    searchLodge,
    __setLodgeService,
} from "../../src/controllers/lodge";
import { LodgeService } from "../../src/services/lodge";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";

describe("LodgeController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockLodgeService: jest.Mocked<LodgeService>;

    const lodgeId = "11111111-1111-1111-1111-111111111111" as UUID;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockLodgeService = {
            createLodge: jest.fn(),
            getAllLodges: jest.fn(),
            getLodgeById: jest.fn(),
            updateLodge: jest.fn(),
            deleteLodge: jest.fn(),
            getAllLocations: jest.fn(),
            searchLodge: jest.fn(),
        } as unknown as jest.Mocked<LodgeService>;

        __setLodgeService(mockLodgeService);
        jest.clearAllMocks();
    });

    describe("createLodge", () => {
        it("should create a lodge and return 201", async () => {
            req.body = {
                name: "Lodge A",
                location_name: "Dhaka",
                location_point: { lat: 23.7, long: 90.4 },
                price: 1000,
            };

            const lodge = {
                ...req.body,
                id: lodgeId,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockLodgeService.createLodge.mockResolvedValue(lodge);

            await createLodge(req as Request, res as Response);

            expect(mockLodgeService.createLodge).toHaveBeenCalledWith(expect.objectContaining({
                name: "Lodge A",
                location_name: "Dhaka",
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(lodge);
        });

        it("should throw UnprocessableEntityException if invalid body", async () => {
            req.body = { name: 123 };

            await expect(createLodge(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);
        });
    });

    describe("getAllLodges", () => {
        it("should return all lodges", async () => {
            const lodges = [{ id: lodgeId, name: "A", location_name: "B", location_point: { lat: 0, long: 0 }, price: 100, created_at: new Date(), updated_at: new Date() }];
            mockLodgeService.getAllLodges.mockResolvedValue(lodges);

            await getAllLodges(req as Request, res as Response);

            expect(mockLodgeService.getAllLodges).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(lodges);
        });
    });

    describe("getLodgeById", () => {
        it("should return lodge by id", async () => {
            req.params = { id: lodgeId };

            const lodge = {
                id: lodgeId,
                name: "Test",
                location_name: "Loc",
                location_point: { lat: 0, long: 0 },
                price: 100,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockLodgeService.getLodgeById.mockResolvedValue(lodge);

            await getLodgeById(req as Request, res as Response);

            expect(mockLodgeService.getLodgeById).toHaveBeenCalledWith(lodgeId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(lodge);
        });

        it("should throw BadRequestException for invalid ID", async () => {
            req.params = { id: "invalid" };

            await expect(getLodgeById(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("updateLodge", () => {
        it("should update and return lodge", async () => {
            req.params = { id: lodgeId };
            req.body = { name: "Updated Name" };

            const updatedLodge = {
                id: lodgeId,
                name: "Updated Name",
                location_name: "Loc",
                location_point: { lat: 0, long: 0 },
                price: 100,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockLodgeService.updateLodge.mockResolvedValue(updatedLodge);

            await updateLodge(req as Request, res as Response);

            expect(mockLodgeService.updateLodge).toHaveBeenCalledWith(lodgeId, expect.objectContaining({ name: "Updated Name" }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedLodge);
        });

        it("should throw BadRequestException for invalid ID", async () => {
            req.params = { id: "invalid" };
            req.body = { name: "test" };

            await expect(updateLodge(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.params = { id: lodgeId };
            req.body = { price: "cheap" };

            await expect(updateLodge(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
        });
    });

    describe("deleteLodge", () => {
        it("should delete a lodge and return 204", async () => {
            req.params = { id: lodgeId };

            await deleteLodge(req as Request, res as Response);

            expect(mockLodgeService.deleteLodge).toHaveBeenCalledWith(lodgeId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw BadRequestException for invalid ID", async () => {
            req.params = { id: "invalid" };

            await expect(deleteLodge(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("getLodgeLocationNames", () => {
        it("should return all lodge locations", async () => {
            const locations = [{ name: "Loc", location_point: { lat: 0, long: 0 } }];
            mockLodgeService.getAllLocations.mockResolvedValue(locations);

            await getLodgeLocationNames(req as Request, res as Response);

            expect(mockLodgeService.getAllLocations).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(locations);
        });
    });

    describe("searchLodge", () => {
        it("should return search results", async () => {
            req.query = { name: "test" };
            const results = [
                {
                    id: lodgeId,
                    name: "test",
                    location_name: "Test City",
                    location_point: { lat: 0, long: 0 },
                    price: 500,
                    description: "Test description",
                    cover_image: "cover.jpg",
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];

            mockLodgeService.searchLodge.mockResolvedValue(results);

            await searchLodge(req as Request, res as Response);

            expect(mockLodgeService.searchLodge).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(results);
        });
    });
});
