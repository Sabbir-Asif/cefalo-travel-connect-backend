import {
    createBlogFood,
    deleteBlogFood,
    getFoodsForBlog,
    __setBlogService,
} from "../../src/controllers/blog-food";
import { BlogFoodService } from "../../src/services/blog-food";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";

jest.mock("../../src/services/blog-food");

describe("BlogFood Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockBlogFoodService: jest.Mocked<BlogFoodService>;

    beforeEach(() => {
        req = { params: {}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockBlogFoodService = {
            createBlogfood: jest.fn(),
            deleteBlogFood: jest.fn(),
            getFoodsForBlog: jest.fn(),
        } as unknown as jest.Mocked<BlogFoodService>;

        __setBlogService(mockBlogFoodService);
        jest.clearAllMocks();
    });

    describe("createBlogFood", () => {
        it("should create blog food and return 201 with result", async () => {
            const fakeBlogId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID;
            const fakeFoodId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID;

            req.body = { blog_id: fakeBlogId, food_id: fakeFoodId };
            const fakeResult = { blog_id: fakeBlogId, food_id: fakeFoodId };
            mockBlogFoodService.createBlogfood.mockResolvedValue(fakeResult);

            await createBlogFood(req as Request, res as Response);

            expect(mockBlogFoodService.createBlogfood).toHaveBeenCalledWith(fakeBlogId, fakeFoodId);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(fakeResult);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.body = { blog_id: "not-a-uuid", food_id: "still-not-a-uuid" };

            await expect(createBlogFood(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );

            expect(mockBlogFoodService.createBlogfood).not.toHaveBeenCalled();
        });
    });

    describe("deleteBlogFood", () => {
        it("should delete blog food and return 204 with deletedCount", async () => {
            const blogId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID;
            const foodId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID;

            req.params = { blogId, foodId };
            mockBlogFoodService.deleteBlogFood.mockResolvedValue(1);

            await deleteBlogFood(req as Request, res as Response);

            expect(mockBlogFoodService.deleteBlogFood).toHaveBeenCalledWith(blogId, foodId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ deletedCount: 1 });
        });

        it("should throw UnprocessableEntityException for invalid blogId", async () => {
            req.params = { blogId: "invalid", foodId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" };

            await expect(deleteBlogFood(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );
            expect(mockBlogFoodService.deleteBlogFood).not.toHaveBeenCalled();
        });

        it("should throw UnprocessableEntityException for invalid foodId", async () => {
            req.params = { blogId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", foodId: "invalid" };

            await expect(deleteBlogFood(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );
            expect(mockBlogFoodService.deleteBlogFood).not.toHaveBeenCalled();
        });
    });

    describe("getFoodsForBlog", () => {
        it("should return foods for blog with 200 status", async () => {
            const blogId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID;

            req.params = { id: blogId };

            const fakeFoods = [
                {
                    id: "food1" as UUID,
                    name: "Pizza",
                    category: "Fast Food",
                    provider: "Provider A",
                    location: "Location A",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockBlogFoodService.getFoodsForBlog.mockResolvedValue(fakeFoods);

            await getFoodsForBlog(req as Request, res as Response);

            expect(mockBlogFoodService.getFoodsForBlog).toHaveBeenCalledWith(blogId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeFoods);
        });

        it("should throw UnprocessableEntityException for invalid blog id", async () => {
            req.params = { id: "invalid-uuid" };

            await expect(getFoodsForBlog(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );

            expect(mockBlogFoodService.getFoodsForBlog).not.toHaveBeenCalled();
        });
    });
});
