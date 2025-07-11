// tests/services/liked-blog.service.test.ts
import { LikedBlogService } from "../../src/services/liked-blog";
import { BlogReaction } from "../../src/interfaces/liked-blog";
import { Role } from "../../src/interfaces/user";
import { ErrorCode } from "../../src/exceptions/root";
import { NotFoundException } from "../../src/exceptions/not-found";
import { LikedBlogResponseDto } from "../../src/dtos/liked-blog";
import { BlogResponseDto } from "../../src/dtos/blog";
import { UserResponseDto } from "../../src/dtos/user";
import { UUID } from "crypto";

const mockUser = {
  id: "user-uuid" as UUID,
  name: "John Doe",
  email: "john@example.com",
  phone_number: "1234567890",
  displayPicture: null,
  bio: null,
  is_verified: true,
  role: Role.TRAVELER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBlog = {
  id: "blog-uuid" as UUID,
  title: "Trip to Cox's Bazar",
  userId: "user-uuid" as const,
  locationName: "Cox's Bazar",
  location_points: { lat: 21.4272, long: 92.0058 },
  description: "Beautiful beach",
  cover_image: null,
  status: "PUBLISHED",
  tags: ["beach"],
  images: [],
  videos: [],
  created_at: new Date(),
  updated_at: new Date(),
};

const mockReaction = {
  blog_id: mockBlog.id,
  user_id: mockUser.id,
  reaction_name: BlogReaction.Amazed,
  created_at: new Date(),
};

describe("LikedBlogService", () => {
  let likedBlogService: LikedBlogService;
  const likedBlogRepository: any = {
    findByUserAndBlog: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    usersForBlog: jest.fn(),
    blogsForUser: jest.fn(),
  };
  const userRepository: any = {
    findById: jest.fn(),
  };
  const blogRepository: any = {
    getById: jest.fn(),
  };

  beforeEach(() => {
    likedBlogService = new LikedBlogService(
      likedBlogRepository,
      userRepository,
      blogRepository
    );
    jest.clearAllMocks();
  });

  describe("reactToBlog", () => {
    it("should create a new reaction if none exists", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      blogRepository.getById.mockResolvedValue(mockBlog);
      likedBlogRepository.findByUserAndBlog.mockResolvedValue(null);
      likedBlogRepository.create.mockResolvedValue(mockReaction);

      const result = await likedBlogService.reactToBlog({
        blog_id: mockBlog.id as UUID,
        user_id: mockUser.id,
        reaction_name: BlogReaction.Amazed,
      });

      expect(result).toBeInstanceOf(LikedBlogResponseDto);
    });

    it("should return existing reaction if reaction matches", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      blogRepository.getById.mockResolvedValue(mockBlog);
      likedBlogRepository.findByUserAndBlog.mockResolvedValue(mockReaction);

      const result = await likedBlogService.reactToBlog({
        blog_id: mockBlog.id as UUID,
        user_id: mockUser.id,
        reaction_name: BlogReaction.Amazed,
      });

      expect(result).toBeInstanceOf(LikedBlogResponseDto);
      expect(likedBlogRepository.update).not.toHaveBeenCalled();
    });

    it("should update reaction if new reaction is different", async () => {
      const updatedReaction = {
        ...mockReaction,
        reaction_name: BlogReaction.Curious,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      blogRepository.getById.mockResolvedValue(mockBlog);
      likedBlogRepository.findByUserAndBlog.mockResolvedValue(mockReaction);
      likedBlogRepository.update.mockResolvedValue(updatedReaction);

      const result = await likedBlogService.reactToBlog({
        blog_id: mockBlog.id as UUID,
        user_id: mockUser.id,
        reaction_name: BlogReaction.Curious,
      });

      expect(result).toBeInstanceOf(LikedBlogResponseDto);
    });

    it("should throw if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        likedBlogService.reactToBlog({
          blog_id: mockBlog.id as UUID,
          user_id: mockUser.id,
          reaction_name: BlogReaction.Amazed,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if blog not found", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      blogRepository.getById.mockResolvedValue(null);

      await expect(
        likedBlogService.reactToBlog({
          blog_id: mockBlog.id as UUID,
          user_id: mockUser.id,
          reaction_name: BlogReaction.Amazed,
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeReaction", () => {
    it("should delete existing reaction", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      blogRepository.getById.mockResolvedValue(mockBlog);
      likedBlogRepository.delete.mockResolvedValue(1);

      await expect(
        likedBlogService.removeReaction(mockUser.id, mockBlog.id)
      ).resolves.toBeUndefined();
    });

    it("should throw if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        likedBlogService.removeReaction(mockUser.id, mockBlog.id)
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if blog not found", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      blogRepository.getById.mockResolvedValue(null);

      await expect(
        likedBlogService.removeReaction(mockUser.id, mockBlog.id)
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if no reaction exists", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      blogRepository.getById.mockResolvedValue(mockBlog);
      likedBlogRepository.delete.mockResolvedValue(0);

      await expect(
        likedBlogService.removeReaction(mockUser.id, mockBlog.id)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUsersWhoReacted", () => {
    it("should return list of users", async () => {
      blogRepository.getById.mockResolvedValue(mockBlog);
      likedBlogRepository.usersForBlog.mockResolvedValue([mockUser]);

      const result = await likedBlogService.getUsersWhoReacted(mockBlog.id);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
    });

    it("should throw if blog not found", async () => {
      blogRepository.getById.mockResolvedValue(null);

      await expect(
        likedBlogService.getUsersWhoReacted(mockBlog.id)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getBlogsUserReacted", () => {
    it("should return list of blogs", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      likedBlogRepository.blogsForUser.mockResolvedValue([mockBlog]);

      const result = await likedBlogService.getBlogsUserReacted(mockUser.id);
      expect(result[0]).toBeInstanceOf(BlogResponseDto);
    });

    it("should throw if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        likedBlogService.getBlogsUserReacted(mockUser.id)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
