import {
    createTourMember,
    deleteTourMember,
    getMembersForTravelPlan,
    __setTourMemberService,
} from "../../src/controllers/tour-member";
import { TourMemberService } from "../../src/services/tour-member";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { Role } from "../../src/interfaces/user";

describe("TourMemberController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTourMemberService: jest.Mocked<TourMemberService>;

    const travelplanId = "11111111-1111-1111-1111-111111111111" as UUID;
    const userId = "22222222-2222-2222-2222-222222222222" as UUID;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockTourMemberService = {
            createTourMember: jest.fn(),
            deleteTourMember: jest.fn(),
            getMembersForTravelPlan: jest.fn(),
        } as unknown as jest.Mocked<TourMemberService>;

        __setTourMemberService(mockTourMemberService);
        jest.clearAllMocks();
    });

    describe("createTourMember", () => {
        it("should create and return 201", async () => {
            req.body = { travelplan_id: travelplanId, user_id: userId };
            const result = { travelplan_id: travelplanId, user_id: userId };

            mockTourMemberService.createTourMember.mockResolvedValue(result);

            await createTourMember(req as Request, res as Response);

            expect(mockTourMemberService.createTourMember).toHaveBeenCalledWith(travelplanId, userId);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("should throw UnprocessableEntityException if body is invalid", async () => {
            req.body = { travelplan_id: 123 }; // invalid

            await expect(createTourMember(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourMemberService.createTourMember).not.toHaveBeenCalled();
        });
    });

    describe("deleteTourMember", () => {
        it("should delete and return 204", async () => {
            req.params = { travelplanId, userId };

            mockTourMemberService.deleteTourMember.mockResolvedValue(1);

            await deleteTourMember(req as Request, res as Response);

            expect(mockTourMemberService.deleteTourMember).toHaveBeenCalledWith(travelplanId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ deleted: 1 });
        });

        it("should throw UnprocessableEntityException if travelplanId is invalid", async () => {
            req.params = { travelplanId: "invalid", userId };

            await expect(deleteTourMember(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourMemberService.deleteTourMember).not.toHaveBeenCalled();
        });

        it("should throw UnprocessableEntityException if userId is invalid", async () => {
            req.params = { travelplanId, userId: "invalid" };

            await expect(deleteTourMember(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourMemberService.deleteTourMember).not.toHaveBeenCalled();
        });
    });

    describe("getMembersForTravelPlan", () => {
        it("should return members", async () => {
            req.params = { id: travelplanId };

            const members = [{
                id: userId,
                name: "Alice",
                email: "alice@example.com",
                password: "hashed",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "123",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }];

            mockTourMemberService.getMembersForTravelPlan.mockResolvedValue(members);

            await getMembersForTravelPlan(req as Request, res as Response);

            expect(mockTourMemberService.getMembersForTravelPlan).toHaveBeenCalledWith(travelplanId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(members);
        });

        it("should throw UnprocessableEntityException if travelplanId invalid", async () => {
            req.params = { id: "invalid" };

            await expect(getMembersForTravelPlan(req as Request, res as Response))
                .rejects.toThrow(UnprocessableEntityException);

            expect(mockTourMemberService.getMembersForTravelPlan).not.toHaveBeenCalled();
        });
    });
});
