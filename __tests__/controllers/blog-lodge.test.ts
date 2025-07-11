import { Request, Response } from "express";
import {
  createBlogLodge,
  deleteBlogLodge,
  getLodgesForBlog,
  __setBlogLodgeService,
} from "../../src/controllers/blog-lodge";

import { BlogLodgeService } from "../../src/services/blog-lodge";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { UUID } from "crypto";

describe("BlogLodge Controller", () => {
  let mockService: jest.Mocked<BlogLodgeService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    mockService = {
      createBlogLodge: jest.fn(),
      deleteBlogLodge: jest.fn(),
      getLodgesForBlog: jest.fn(),
    } as unknown as jest.Mocked<BlogLodgeService>;

    __setBlogLodgeService(mockService);

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("createBlogLodge", () => {
    it("should create a blog lodge and return 201 with result", async () => {
      const fakeResult = { blog_id: "11111111-1111-1111-1111-111111111111" as UUID, lodge_id: "22222222-2222-2222-2222-222222222222" as UUID };
      req.body = { blog_id: fakeResult.blog_id, lodge_id: fakeResult.lodge_id };

      mockService.createBlogLodge.mockResolvedValue(fakeResult);

      await createBlogLodge(req as Request, res as Response);

      expect(mockService.createBlogLodge).toHaveBeenCalledWith(fakeResult.blog_id, fakeResult.lodge_id);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(fakeResult);
    });

    it("should throw UnprocessableEntityException on invalid body", async () => {
      req.body = { blog_id: "not-a-uuid", lodge_id: null };

      await expect(createBlogLodge(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
      expect(mockService.createBlogLodge).not.toHaveBeenCalled();
    });
  });

  describe("deleteBlogLodge", () => {
    it("should delete a blog lodge and return 204", async () => {
      req.params = {
        blogId: "11111111-1111-1111-1111-111111111111",
        lodgeId: "22222222-2222-2222-2222-222222222222",
      };

      mockService.deleteBlogLodge.mockResolvedValue(1);

      await deleteBlogLodge(req as Request, res as Response);

      expect(mockService.deleteBlogLodge).toHaveBeenCalledWith(
        "11111111-1111-1111-1111-111111111111",
        "22222222-2222-2222-2222-222222222222"
      );
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(jsonMock).toHaveBeenCalledWith({ deleted: 1 });
    });

    it("should throw UnprocessableEntityException on invalid blogId", async () => {
      req.params = { blogId: "invalid-uuid", lodgeId: "22222222-2222-2222-2222-222222222222" };

      await expect(deleteBlogLodge(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
      expect(mockService.deleteBlogLodge).not.toHaveBeenCalled();
    });

    it("should throw UnprocessableEntityException on invalid lodgeId", async () => {
      req.params = { blogId: "11111111-1111-1111-1111-111111111111", lodgeId: "invalid-uuid" };

      await expect(deleteBlogLodge(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
      expect(mockService.deleteBlogLodge).not.toHaveBeenCalled();
    });
  });

  describe("getLodgesForBlog", () => {
    const lodges = [
        {
            lodge_id: "22222222-2222-2222-2222-222222222222" as UUID,
            name: "Lodge A",
            id: "22222222-2222-2222-2222-222222222222",
            location_name: "Location A",
            location_point: { lat: 0, lng: 0 },
            price: 100,
        },
    ];

    it("should throw UnprocessableEntityException on invalid blog ID", async () => {
      req.params = { id: "invalid-uuid" };

      await expect(getLodgesForBlog(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
      expect(mockService.getLodgesForBlog).not.toHaveBeenCalled();
    });
  });
});
