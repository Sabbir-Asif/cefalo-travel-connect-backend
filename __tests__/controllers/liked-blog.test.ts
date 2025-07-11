import {
    reactToBlog,
    removeReaction,
    getUsersWhoReacted,
    getBlogsUserReacted,
    __setLikedBlogService,
  } from "../../src/controllers/liked-blog";
  import { LikedBlogService } from "../../src/services/liked-blog";
  import { Request, Response } from "express";
  import { UUID } from "crypto";
  import { BlogReaction, LikedBlogResponse } from "../../src/interfaces/liked-blog";
  import { UnprocessableEntityException } from "../../src/exceptions/validation";
  import { BadRequestException } from "../../src/exceptions/bad-request";
  import { UnauthorizedException } from "../../src/exceptions/unauthorized";
  import { Role, UserResponse } from "../../src/interfaces/user";
  import { Blog, Blog_Status } from "../../src/interfaces/blog";
  
  const createMockUserResponse = (overrides: Partial<UserResponse> = {}): UserResponse => ({
    id: "11111111-1111-1111-1111-111111111111" as UUID,
    name: "Alice",
    email: "alice@example.com",
    role: Role.TRAVELER,
    displayPicture: null,
    bio: null,
    phone_number: "01700000000",
    is_verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
  
  const createMockBlog = (overrides: Partial<Blog> = {}): Blog => ({
    id: "22222222-2222-2222-2222-222222222222" as UUID,
    title: "Reacted Blog",
    userId: "11111111-1111-1111-1111-111111111111" as UUID,
    locationName: "Dhaka",
    location_points: { lat: 23.8103, long: 90.4125 },
    description: "Test blog",
    cover_image: null,
    status: Blog_Status.PUBLISHED,
    tags: [],
    images: [],
    videos: [],
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  });
  
  describe("LikedBlogController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockLikedBlogService: jest.Mocked<LikedBlogService>;
  
    const userId = "11111111-1111-1111-1111-111111111111" as UUID;
    const blogId = "22222222-2222-2222-2222-222222222222" as UUID;
  
    beforeEach(() => {
      req = {
        body: {},
        params: {},
        query: {},
        user: createMockUserResponse(),
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
  
      mockLikedBlogService = {
        reactToBlog: jest.fn(),
        removeReaction: jest.fn(),
        getUsersWhoReacted: jest.fn(),
        getBlogsUserReacted: jest.fn(),
      } as unknown as jest.Mocked<LikedBlogService>;
  
      __setLikedBlogService(mockLikedBlogService);
      jest.clearAllMocks();
    });
  
    describe("reactToBlog", () => {
      it("should react to a blog and return 200", async () => {
        req.body = {
          blog_id: blogId,
          reaction_name: BlogReaction.Useful,
        };
  
        const response: LikedBlogResponse = {
          blog_id: blogId,
          user_id: userId,
          reaction_name: BlogReaction.Useful,
          created_at: new Date(),
        };
  
        mockLikedBlogService.reactToBlog.mockResolvedValue(response);
  
        await reactToBlog(req as Request, res as Response, jest.fn());
  
        expect(mockLikedBlogService.reactToBlog).toHaveBeenCalledWith(expect.objectContaining({
          blog_id: blogId,
          user_id: userId,
          reaction_name: BlogReaction.Useful,
        }));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
      });
  
      it("should throw UnprocessableEntityException if body is invalid", async () => {
        req.body = { reaction_name: "invalid" };
  
        await expect(reactToBlog(req as Request, res as Response, jest.fn()))
          .rejects.toThrow(UnprocessableEntityException);
      });

    });
  
    describe("removeReaction", () => {
      it("should remove reaction and return 204", async () => {
        req.params = { blogId };
  
        await removeReaction(req as Request, res as Response, jest.fn());
  
        expect(mockLikedBlogService.removeReaction).toHaveBeenCalledWith(userId, blogId);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
      });
  
      it("should throw BadRequestException if blogId is invalid", async () => {
        req.params = { blogId: "invalid" };
  
        await expect(removeReaction(req as Request, res as Response, jest.fn()))
          .rejects.toThrow(BadRequestException);
      });
  
    });
  
    describe("getUsersWhoReacted", () => {
      it("should return users who reacted", async () => {
        req.params = { blogId };
        const users = [createMockUserResponse()];
        mockLikedBlogService.getUsersWhoReacted.mockResolvedValue(users);
  
        await getUsersWhoReacted(req as Request, res as Response, jest.fn());
  
        expect(mockLikedBlogService.getUsersWhoReacted).toHaveBeenCalledWith(blogId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(users);
      });
  
      it("should throw BadRequestException if blogId is invalid", async () => {
        req.params = { blogId: "invalid" };
  
        await expect(getUsersWhoReacted(req as Request, res as Response, jest.fn()))
          .rejects.toThrow(BadRequestException);
      });
    });
  
    describe("getBlogsUserReacted", () => {
      it("should return blogs reacted by user", async () => {
        const blogs = [createMockBlog()];
        mockLikedBlogService.getBlogsUserReacted.mockResolvedValue(blogs);
  
        await getBlogsUserReacted(req as Request, res as Response, jest.fn());
  
        expect(mockLikedBlogService.getBlogsUserReacted).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(blogs);
      });
  
      it("should throw UnauthorizedException if user ID is missing", async () => {
        req.user = undefined;
  
        await expect(getBlogsUserReacted(req as Request, res as Response, jest.fn()))
          .rejects.toThrow(UnauthorizedException);
      });
    });
  });
  