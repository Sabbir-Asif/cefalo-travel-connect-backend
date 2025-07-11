import { BlogService } from "../../src/services/blog";
import { IBlogRepository } from "../../src/repositories/blog";
import { Blog, Blog_Status, CreateBlog, UpdateBlog } from "../../src/interfaces/blog";
import { ErrorCode } from "../../src/exceptions/root";
import { NotFoundException } from "../../src/exceptions/not-found";
import { ForbiddenException } from "../../src/exceptions/forbidden";
import { userService } from "../../src/controllers/user";

jest.mock("../../src/controllers/user");

const mockBlogRepository: jest.Mocked<IBlogRepository> = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
};

const now = new Date();
const blog: Blog = {
  id: "11111111-1111-1111-1111-111111111111",
  userId: "22222222-2222-2222-2222-222222222222",
  title: "Test Blog",
  locationName: "Test Location",
  location_points: { lat: 10.0, long: 20.0 },
  description: "Test description",
  cover_image: null,
  status: Blog_Status.DRAFT,
  tags: ["tag1", "tag2"],
  images: ["image1.jpg"],
  videos: ["video1.mp4"],
  created_at: now,
  updated_at: now,
};

const blogService = new BlogService(mockBlogRepository);

describe("BlogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBlog", () => {
    it("should create a blog successfully", async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: blog.userId });
      mockBlogRepository.create.mockResolvedValue(blog);

      const result = await blogService.createBlog(blog.userId, {
        title: blog.title,
        locationName: blog.locationName,
        location_points: blog.location_points,
        description: blog.description,
        tags: blog.tags,
        images: blog.images,
        videos: blog.videos,
      });

      expect(result).toMatchObject({ id: blog.id, title: blog.title });
    });

    it("should throw NotFoundException if user does not exist", async () => {
      (userService.getUserById as jest.Mock).mockRejectedValueOnce(
        new NotFoundException("User not found", ErrorCode.USER_NOTFOUND)
      );

      await expect(blogService.createBlog(blog.userId, {
        title: blog.title,
        locationName: blog.locationName,
        location_points: blog.location_points,
        description: blog.description,
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe("getAllBlogs", () => {
    it("should return all blogs", async () => {
      mockBlogRepository.getAll.mockResolvedValue([blog]);

      const result = await blogService.getAllBlogs();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(blog.id);
    });
  });

  describe("getBlogById", () => {
    it("should return blog by ID", async () => {
      mockBlogRepository.getById.mockResolvedValue(blog);

      const result = await blogService.getBlogById(blog.id);

      expect(result.id).toBe(blog.id);
    });

    it("should throw NotFoundException if blog not found", async () => {
      mockBlogRepository.getById.mockResolvedValue(null);

      await expect(blogService.getBlogById(blog.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateBlog", () => {
    it("should update blog if user is owner", async () => {
      mockBlogRepository.getById.mockResolvedValue(blog);
      mockBlogRepository.update.mockResolvedValue({
        ...blog,
        title: "Updated Title",
      });

      const result = await blogService.updateBlog(blog.id, blog.userId, { title: "Updated Title" });

      expect(result.title).toBe("Updated Title");
    });

    it("should throw NotFoundException if blog not found", async () => {
      mockBlogRepository.getById.mockResolvedValue(null);

      await expect(blogService.updateBlog(blog.id, blog.userId, { title: "Test" }))
        .rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not owner", async () => {
      mockBlogRepository.getById.mockResolvedValue(blog);

      await expect(blogService.updateBlog(blog.id, "33333333-3333-3333-3333-333333333333", { title: "Hacked" }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe("deleteBlog", () => {
    it("should delete blog if user is owner", async () => {
      mockBlogRepository.getById.mockResolvedValue(blog);
      mockBlogRepository.delete.mockResolvedValue(1);

      const result = await blogService.deleteBlog(blog.id, blog.userId);

      expect(result).toBe(1);
    });

    it("should throw NotFoundException if blog not found", async () => {
      mockBlogRepository.getById.mockResolvedValue(null);

      await expect(blogService.deleteBlog(blog.id, blog.userId)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user is not owner", async () => {
      mockBlogRepository.getById.mockResolvedValue(blog);

      await expect(blogService.deleteBlog(blog.id, "44444444-4444-4444-4444-444444444444"))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe("searchBlogs", () => {
    it("should return search results", async () => {
      mockBlogRepository.search.mockResolvedValue([blog]);

      const result = await blogService.searchBlogs({ q: "test" });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(blog.id);
    });
  });
});
