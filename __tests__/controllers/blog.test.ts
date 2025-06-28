import { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog, searchBlogs, __setBlogService } from "../../src/controllers/blog";
import { BlogService } from "../../src/services/blog";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { Blog_Status } from "../../src/interfaces/blog";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { Role } from "../../src/interfaces/user";

jest.mock("../../src/services/blog");

describe("Blog Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockBlogService: jest.Mocked<BlogService>;

    const userId = "2cd2c195-8e2c-4066-a1d5-73b8205e04ee" as UUID;
    const blogId = "1912f036-e02b-441a-9fe9-de559c8a2127" as UUID;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: {
                id: userId,
                name: "Test User",
                email: "test@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "0123456789",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockBlogService = {
            createBlog: jest.fn(),
            getAllBlogs: jest.fn(),
            getBlogById: jest.fn(),
            updateBlog: jest.fn(),
            deleteBlog: jest.fn(),
            searchBlogs: jest.fn()
        } as unknown as jest.Mocked<BlogService>;

        __setBlogService(mockBlogService);
        jest.clearAllMocks();
    });

    describe("createBlog", () => {
        it("should create blog and return 201", async () => {
            req.body = {
                title: "Test Blog",
                locationName: "Cox's Bazar",
                location_points: { lat: 21.43, long: 91.97 },
                description: "Nice trip",
            };

            const blog = {
                id: blogId,
                userId,
                ...req.body,
                tags: [],
                images: [],
                videos: [],
                cover_image: null,
                status: Blog_Status.DRAFT,
                created_at: new Date(),
                updated_at: new Date()
            };

            mockBlogService.createBlog.mockResolvedValue(blog);

            await createBlog(req as Request, res as Response, jest.fn());

            expect(mockBlogService.createBlog).toHaveBeenCalledWith(userId, expect.objectContaining({ title: "Test Blog" }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(blog);
        });

        it("should throw UnprocessableEntityException for invalid input", async () => {
            req.body = { invalid: "data" };

            await expect(createBlog(req as Request, res as Response, jest.fn()))
                .rejects.toThrow(UnprocessableEntityException);
            expect(mockBlogService.createBlog).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException if user id is invalid", async () => {
            req.body = {
                title: "Test Blog",
                locationName: "Cox's Bazar",
                location_points: { lat: 21.43, long: 91.97 },
                description: "Nice trip"
            };

            req.user!.id = "invalid-id" as unknown as UUID;

            await expect(createBlog(req as Request, res as Response, jest.fn()))
                .rejects.toThrow(UnauthorizedException);
            expect(mockBlogService.createBlog).not.toHaveBeenCalled();
        });
    });

    describe("getAllBlogs", () => {
        it("should return all blogs", async () => {
            const blogs = [{
                id: blogId,
                userId,
                title: "Blog",
                locationName: "Place",
                location_points: { lat: 1, long: 2 },
                description: "",
                tags: [],
                images: [],
                videos: [],
                cover_image: null,
                status: Blog_Status.PUBLISHED,
                created_at: new Date(),
                updated_at: new Date()
            }];
            mockBlogService.getAllBlogs.mockResolvedValue(blogs);

            await getAllBlogs(req as Request, res as Response, jest.fn());

            expect(mockBlogService.getAllBlogs).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(blogs);
        });
    });

    describe("getBlogById", () => {
        it("should return blog by ID", async () => {
            req.params = { id: blogId };
            const blog = {
                id: blogId,
                userId,
                title: "Title",
                locationName: "",
                location_points: { lat: 0, long: 0 },
                description: "",
                tags: [],
                images: [],
                videos: [],
                cover_image: null,
                status: Blog_Status.PUBLISHED,
                created_at: new Date(),
                updated_at: new Date()
            };
            mockBlogService.getBlogById.mockResolvedValue(blog);

            await getBlogById(req as Request, res as Response, jest.fn());

            expect(mockBlogService.getBlogById).toHaveBeenCalledWith(blogId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(blog);
        });

        it("should throw BadRequestException for invalid ID", async () => {
            req.params = { id: "invalid" };

            await expect(getBlogById(req as Request, res as Response, jest.fn()))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe("updateBlog", () => {
        it("should update and return blog", async () => {
            req.params = { id: blogId };
            req.body = { title: "Updated Title" };

            const blog = {
                id: blogId,
                userId,
                title: "Updated Title",
                locationName: "",
                location_points: { lat: 0, long: 0 },
                description: "",
                tags: [],
                images: [],
                videos: [],
                cover_image: null,
                status: Blog_Status.PUBLISHED,
                created_at: new Date(),
                updated_at: new Date()
            };

            mockBlogService.updateBlog.mockResolvedValue(blog);

            await updateBlog(req as Request, res as Response, jest.fn());

            expect(mockBlogService.updateBlog).toHaveBeenCalledWith(blogId, userId, expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(blog);
        });
    });

    describe("deleteBlog", () => {
        it("should delete blog and return 204", async () => {
            req.params = { id: blogId };
            mockBlogService.deleteBlog.mockResolvedValue(1);

            await deleteBlog(req as Request, res as Response, jest.fn());

            expect(mockBlogService.deleteBlog).toHaveBeenCalledWith(blogId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ count: 1 });
        });
    });

    describe("searchBlogs", () => {
        it("should return search result", async () => {
            const blogs = [{
                id: blogId,
                userId,
                title: "Searched",
                locationName: "Place",
                location_points: { lat: 0, long: 0 },
                description: "",
                tags: [],
                images: [],
                videos: [],
                cover_image: null,
                status: Blog_Status.DRAFT,
                created_at: new Date(),
                updated_at: new Date()
            }];
            mockBlogService.searchBlogs.mockResolvedValue(blogs);

            await searchBlogs(req as Request, res as Response, jest.fn());

            expect(mockBlogService.searchBlogs).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(blogs);
        });
    });
});
