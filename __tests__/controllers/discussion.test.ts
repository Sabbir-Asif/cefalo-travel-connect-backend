import {
    createDiscussion,
    getDiscussionById,
    getDiscussionsByTravelPlanId,
    deleteDiscussion,
    searchDiscussions,
    __setDiscussionService
} from "../../src/controllers/discussion";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { DiscussionService } from "../../src/services/discussion";
import { Discussion, DiscussionWithSender } from "../../src/interfaces/discussion";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { Role } from "../../src/interfaces/user";

describe("Discussion Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockDiscussionService: jest.Mocked<DiscussionService>;

    const userId = "25d7d803-d63a-4892-bc90-c4635b3f1681" as UUID;
    const discussionId = "984b75f0-7640-46e3-a7d2-fc6a259ab18c" as UUID;
    const travelPlanId = "2d1054c6-9b83-4b59-b321-e7bc01cfe025" as UUID;

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
            json: jest.fn()
        };

        mockDiscussionService = {
            create: jest.fn(),
            getById: jest.fn(),
            getByTravelPlanId: jest.fn(),
            delete: jest.fn(),
            search: jest.fn()
        } as unknown as jest.Mocked<DiscussionService>;

        __setDiscussionService(mockDiscussionService);
        jest.clearAllMocks();
    });

    describe("createDiscussion", () => {
        it("should create discussion and return 201", async () => {
            req.body = {
                travel_plan_id: travelPlanId,
                content: "Let's meet at the station."
            };

            const discussion: Discussion = {
                id: discussionId,
                travel_plan_id: travelPlanId,
                sender_id: userId,
                content: req.body.content,
                created_at: new Date()
            };

            mockDiscussionService.create.mockResolvedValue(discussion);

            await createDiscussion(req as Request, res as Response);

            expect(mockDiscussionService.create).toHaveBeenCalledWith(userId, {
                travel_plan_id: travelPlanId,
                content: req.body.content
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(discussion);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.body = { invalid: "data" };

            await expect(createDiscussion(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
            expect(mockDiscussionService.create).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException for invalid user id", async () => {
            req.user!.id = "invalid-id" as unknown as UUID;
            req.body = {
                travel_plan_id: travelPlanId,
                content: "Hi"
            };

            await expect(createDiscussion(req as Request, res as Response)).rejects.toThrow(UnauthorizedException);
            expect(mockDiscussionService.create).not.toHaveBeenCalled();
        });
    });

    describe("getDiscussionById", () => {
        it("should return discussion by ID", async () => {
            req.params = { id: discussionId };

            const discussion: DiscussionWithSender = {
                id: discussionId,
                travel_plan_id: travelPlanId,
                sender_id: userId,
                content: "Hello",
                created_at: new Date(),
                sender: {
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

            mockDiscussionService.getById.mockResolvedValue(discussion);

            await getDiscussionById(req as Request, res as Response);

            expect(mockDiscussionService.getById).toHaveBeenCalledWith(discussionId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(discussion);
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid" };

            await expect(getDiscussionById(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("getDiscussionsByTravelPlanId", () => {
        it("should return discussions for a travel plan", async () => {
            req.params = { travelPlanId };

            const discussions: DiscussionWithSender[] = [
                {
                    id: discussionId,
                    travel_plan_id: travelPlanId,
                    sender_id: userId,
                    content: "Let's go!",
                    created_at: new Date(),
                    sender: {
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
                }
            ];

            mockDiscussionService.getByTravelPlanId.mockResolvedValue(discussions);

            await getDiscussionsByTravelPlanId(req as Request, res as Response);

            expect(mockDiscussionService.getByTravelPlanId).toHaveBeenCalledWith(travelPlanId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(discussions);
        });

        it("should throw BadRequestException for invalid travel plan id", async () => {
            req.params = { travelPlanId: "invalid" };

            await expect(getDiscussionsByTravelPlanId(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("deleteDiscussion", () => {
        it("should delete discussion and return 204", async () => {
            req.params = { id: discussionId };

            mockDiscussionService.delete.mockResolvedValue();

            await deleteDiscussion(req as Request, res as Response);

            expect(mockDiscussionService.delete).toHaveBeenCalledWith(discussionId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw UnauthorizedException if user id is invalid", async () => {
            req.params = { id: discussionId };
            req.user!.id = "invalid" as unknown as UUID;

            await expect(deleteDiscussion(req as Request, res as Response)).rejects.toThrow(UnauthorizedException);
        });

        it("should throw BadRequestException if discussion id is invalid", async () => {
            req.params = { id: "invalid" };

            await expect(deleteDiscussion(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("searchDiscussions", () => {
        it("should return search results", async () => {
            req.query = { keyword: "trip" };

            const discussions: DiscussionWithSender[] = [];

            mockDiscussionService.search.mockResolvedValue(discussions);

            await searchDiscussions(req as Request, res as Response);

            expect(mockDiscussionService.search).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(discussions);
        });
    });
});
