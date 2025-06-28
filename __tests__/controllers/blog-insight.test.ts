import { createBlogInsight, getAllBlogInsights, getBlogInsightById, getBlogInsightsByBlogId, updateBlogInsight, deleteBlogInsight, searchBlogInsights, __setBlogInsightService, } from "../../src/controllers/blog-insight";
import { BlogInsightService } from "../../src/services/blog-insight";
import { Request, Response, NextFunction } from "express";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { Role, UserResponse } from "../../src/interfaces/user";
import { CreateBlogInsightDto, UpdateBlogInsightDto } from "../../src/dtos/blog-insight";

jest.mock("../../src/services/blog-insight");

describe("BlogInsight Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let mockBlogInsightService: jest.Mocked<BlogInsightService>;

    const mockUser: UserResponse = {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID,
        name: "Test User",
        email: "test@example.com",
        role: Role.TRAVELER,
        displayPicture: "http://example.com/pic.jpg",
        bio: null,
        is_verified: true,
        phone_number: '01800000000',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: mockUser,
            query: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        mockBlogInsightService = {
            createInsight: jest.fn(),
            getAllInsights: jest.fn(),
            getInsightById: jest.fn(),
            getInsightByBlogId: jest.fn(),
            updateInsight: jest.fn(),
            deleteInsight: jest.fn(),
            searchInsights: jest.fn(),
        } as unknown as jest.Mocked<BlogInsightService>;

        __setBlogInsightService(mockBlogInsightService);
        jest.clearAllMocks();
    });

    describe("createBlogInsight", () => {
        it("should create blog insight and return 201 with result", async () => {
            const blogId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID;
            req.params = { blogId };
            req.body = { label: "Label", data: "Some data" };

            const fakeResult = {
                id: "cccccccc-cccc-cccc-cccc-cccccccccccc" as UUID,
                blog_id: blogId,
                user_id: mockUser.id,
                label: "Label",
                data: "Some data",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockBlogInsightService.createInsight.mockResolvedValue(fakeResult);

            await createBlogInsight(req as Request, res as Response, next);

            expect(mockBlogInsightService.createInsight).toHaveBeenCalledWith(
                mockUser.id,
                blogId,
                new CreateBlogInsightDto(req.body)
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fakeResult);
        });

        it("should throw BadRequestException for invalid blogId param", async () => {
            req.params = { blogId: "invalid-uuid" as any };
            req.body = { label: "Label", data: "Some data" };

            await expect(createBlogInsight(req as Request, res as Response, next)).rejects.toThrow(
                BadRequestException
            );
            expect(mockBlogInsightService.createInsight).not.toHaveBeenCalled();
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.params = { blogId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID };
            req.body = { label: 123, data: null };

            await expect(createBlogInsight(req as Request, res as Response, next)).rejects.toThrow(
                UnprocessableEntityException
            );
            expect(mockBlogInsightService.createInsight).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException if req.user invalid", async () => {
            req.params = { blogId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID };
            req.body = { label: "Label", data: "Some data" };
            req.user = {} as any;

            await expect(createBlogInsight(req as Request, res as Response, next)).rejects.toThrow(
                UnauthorizedException
            );
            expect(mockBlogInsightService.createInsight).not.toHaveBeenCalled();
        });
    });

    describe("getAllBlogInsights", () => {
        it("should return all insights with 200 status", async () => {
            const fakeInsights = [
                {
                    id: "cccccccc-cccc-cccc-cccc-cccccccccccc" as UUID,
                    blog_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID,
                    user_id: mockUser.id,
                    label: "Label",
                    data: "Some data",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            mockBlogInsightService.getAllInsights.mockResolvedValue(fakeInsights);

            await getAllBlogInsights(req as Request, res as Response);

            expect(mockBlogInsightService.getAllInsights).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeInsights);
        });
    });

    describe("getBlogInsightById", () => {
        it("should return blog insight by id with 200 status", async () => {
            const insightId = "dddddddd-dddd-dddd-dddd-dddddddddddd" as UUID;
            req.params = { id: insightId };

            const fakeInsight = {
                id: insightId,
                blog_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID,
                user_id: mockUser.id,
                label: "Label",
                data: "Some data",
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockBlogInsightService.getInsightById.mockResolvedValue(fakeInsight);

            await getBlogInsightById(req as Request, res as Response);

            expect(mockBlogInsightService.getInsightById).toHaveBeenCalledWith(insightId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeInsight);
        });

        it("should throw BadRequestException for invalid insight id", async () => {
            req.params = { id: "invalid-uuid" as any };

            await expect(getBlogInsightById(req as Request, res as Response)).rejects.toThrow(
                BadRequestException
            );
            expect(mockBlogInsightService.getInsightById).not.toHaveBeenCalled();
        });
    });

    describe("getBlogInsightsByBlogId", () => {
        it("should return insights for blog with 200 status", async () => {
            const blogId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID;
            req.params = { blogId };

            const fakeInsights = [
                {
                    id: "cccccccc-cccc-cccc-cccc-cccccccccccc" as UUID,
                    blog_id: blogId,
                    user_id: mockUser.id,
                    label: "Label",
                    data: "Some data",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            mockBlogInsightService.getInsightByBlogId.mockResolvedValue(fakeInsights);

            await getBlogInsightsByBlogId(req as Request, res as Response);

            expect(mockBlogInsightService.getInsightByBlogId).toHaveBeenCalledWith(blogId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeInsights);
        });

        it("should throw BadRequestException for invalid blog id", async () => {
            req.params = { blogId: "invalid-uuid" as any };

            await expect(getBlogInsightsByBlogId(req as Request, res as Response)).rejects.toThrow(
                BadRequestException
            );
            expect(mockBlogInsightService.getInsightByBlogId).not.toHaveBeenCalled();
        });
    });

    describe("updateBlogInsight", () => {
        it("should update blog insight and return 200 with result", async () => {
            const insightId = "dddddddd-dddd-dddd-dddd-dddddddddddd" as UUID;
            req.params = { id: insightId };
            req.body = { label: "Updated Label", data: "Updated Data" };
            req.user = mockUser;

            const fakeUpdated = {
                id: insightId,
                blog_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID,
                user_id: mockUser.id,
                label: "Updated Label",
                data: "Updated Data",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockBlogInsightService.updateInsight.mockResolvedValue(fakeUpdated);

            await updateBlogInsight(req as Request, res as Response);

            expect(mockBlogInsightService.updateInsight).toHaveBeenCalledWith(
                insightId,
                mockUser.id,
                new UpdateBlogInsightDto(req.body)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeUpdated);
        });

        it("should throw BadRequestException for invalid insight id", async () => {
            req.params = { id: "invalid-uuid" as any };
            req.body = { label: "Updated Label" };
            req.user = mockUser;

            await expect(updateBlogInsight(req as Request, res as Response)).rejects.toThrow(
                BadRequestException
            );
            expect(mockBlogInsightService.updateInsight).not.toHaveBeenCalled();
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            const insightId = "dddddddd-dddd-dddd-dddd-dddddddddddd" as UUID;
            req.params = { id: insightId };
            req.body = { label: 1234 };
            req.user = mockUser;

            await expect(updateBlogInsight(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );
            expect(mockBlogInsightService.updateInsight).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException if req.user invalid", async () => {
            const insightId = "dddddddd-dddd-dddd-dddd-dddddddddddd" as UUID;
            req.params = { id: insightId };
            req.body = { label: "Updated Label" };
            req.user = {} as any;

            await expect(updateBlogInsight(req as Request, res as Response)).rejects.toThrow(
                UnauthorizedException
            );
            expect(mockBlogInsightService.updateInsight).not.toHaveBeenCalled();
        });
    });

    describe("deleteBlogInsight", () => {
        it("should delete blog insight and return 204", async () => {
            const insightId = "dddddddd-dddd-dddd-dddd-dddddddddddd" as UUID;
            req.params = { id: insightId };
            req.user = mockUser;

            mockBlogInsightService.deleteInsight.mockResolvedValue();

            await deleteBlogInsight(req as Request, res as Response);

            expect(mockBlogInsightService.deleteInsight).toHaveBeenCalledWith(insightId, mockUser.id);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw BadRequestException for invalid insight id", async () => {
            req.params = { id: "invalid-uuid" as any };
            req.user = mockUser;

            await expect(deleteBlogInsight(req as Request, res as Response)).rejects.toThrow(
                BadRequestException
            );
            expect(mockBlogInsightService.deleteInsight).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException if req.user invalid", async () => {
            const insightId = "dddddddd-dddd-dddd-dddd-dddddddddddd" as UUID;
            req.params = { id: insightId };
            req.user = {} as any;

            await expect(deleteBlogInsight(req as Request, res as Response)).rejects.toThrow(
                UnauthorizedException
            );
            expect(mockBlogInsightService.deleteInsight).not.toHaveBeenCalled();
        });
    });

    describe("searchBlogInsights", () => {
        it("should return search results with 200 status", async () => {
            const fakeInsights = [
                {
                    id: "cccccccc-cccc-cccc-cccc-cccccccccccc" as UUID,
                    blog_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID,
                    user_id: mockUser.id,
                    label: "Label",
                    data: "Some data",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            req.query = { label: "Label" };
            mockBlogInsightService.searchInsights.mockResolvedValue(fakeInsights);

            await searchBlogInsights(req as Request, res as Response);

            expect(mockBlogInsightService.searchInsights).toHaveBeenCalledWith({ label: "Label" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeInsights);
        });
    });
});
