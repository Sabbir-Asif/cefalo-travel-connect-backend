import {
    createTourLodge,
    deleteTourLodge,
    getLodgesForTravelPlan,
    __setTourLodgeService,
} from "../../src/controllers/tour-lodge";

import { TourLodgeService } from "../../src/services/tour-lodge";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";

describe("TourLodgeController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTourLodgeService: jest.Mocked<TourLodgeService>;

    const travelplanId = "11111111-1111-1111-1111-111111111111" as UUID;
    const lodgeId = "22222222-2222-2222-2222-222222222222" as UUID;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockTourLodgeService = {
            createTourLodge: jest.fn(),
            deleteTourLodge: jest.fn(),
            getLodgesForTravelPlan: jest.fn(),
        } as unknown as jest.Mocked<TourLodgeService>;

        __setTourLodgeService(mockTourLodgeService);
        jest.clearAllMocks();
    });

    describe("createTourLodge", () => {
        it("should create and return 201", async () => {
            req.body = { travelplan_id: travelplanId, lodge_id: lodgeId };
            const expectedResult = { travelplan_id: travelplanId, lodge_id: lodgeId };

            mockTourLodgeService.createTourLodge.mockResolvedValue(expectedResult);

            await createTourLodge(req as Request, res as Response);

            expect(mockTourLodgeService.createTourLodge).toHaveBeenCalledWith(travelplanId, lodgeId);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expectedResult);
        });

        it("should throw UnprocessableEntityException if body invalid", async () => {
            req.body = { travelplan_id: 123 }; // invalid UUID

            await expect(createTourLodge(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourLodgeService.createTourLodge).not.toHaveBeenCalled();
        });
    });

    describe("deleteTourLodge", () => {
        it("should delete and return 204", async () => {
            req.params = {
                travelplanId: travelplanId,
                lodgeId: lodgeId,
            };

            mockTourLodgeService.deleteTourLodge.mockResolvedValue(1);

            await deleteTourLodge(req as Request, res as Response);

            expect(mockTourLodgeService.deleteTourLodge).toHaveBeenCalledWith(travelplanId, lodgeId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ deleted: 1 });
        });

        it("should throw UnprocessableEntityException if travelplanId invalid", async () => {
            req.params = { travelplanId: "invalid", lodgeId };

            await expect(deleteTourLodge(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourLodgeService.deleteTourLodge).not.toHaveBeenCalled();
        });

        it("should throw UnprocessableEntityException if lodgeId invalid", async () => {
            req.params = { travelplanId, lodgeId: "invalid" };

            await expect(deleteTourLodge(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourLodgeService.deleteTourLodge).not.toHaveBeenCalled();
        });
    });

    describe("getLodgesForTravelPlan", () => {
        it("should return lodges for given travel plan", async () => {
            req.params = { id: travelplanId };

            const lodges = [{
                id: lodgeId,
                name: "Lodge A",
                location_name: "Place",
                location_point: { lat: 0, long: 0 },
                price: 100,
                created_at: new Date(),
                updated_at: new Date()
            }];

            mockTourLodgeService.getLodgesForTravelPlan.mockResolvedValue(lodges);

            await getLodgesForTravelPlan(req as Request, res as Response);

            expect(mockTourLodgeService.getLodgesForTravelPlan).toHaveBeenCalledWith(travelplanId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(lodges);
        });

        it("should throw UnprocessableEntityException for invalid travelplanId", async () => {
            req.params = { id: "invalid" };

            await expect(getLodgesForTravelPlan(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourLodgeService.getLodgesForTravelPlan).not.toHaveBeenCalled();
        });
    });
});
