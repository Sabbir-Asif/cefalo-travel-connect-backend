import { BlogInsightService } from '../../src/services/blog-insight';
import { IBlogInsightRepository } from '../../src/repositories/blog-insight';
import { UUID } from 'crypto';
import { Role, UserResponse } from '../../src/interfaces/user';
import { BlogInsight, CreateBlogInsight, UpdateBlogInsight } from '../../src/interfaces/blog-insight';
import { blogService } from '../../src/controllers/blog';
import { userService } from '../../src/controllers/user';
import { NotFoundException } from '../../src/exceptions/not-found';
import { ForbiddenException } from '../../src/exceptions/forbidden';
import { BlogInsightResponseDto } from '../../src/dtos/blog-insight';

jest.mock('../../src/controllers/blog');
jest.mock('../../src/controllers/user');

const now = new Date();

const user: UserResponse = {
  id: '00000000-0000-0000-0000-000000000001' as UUID,
  name: 'Test User',
  email: 'test@example.com',
  role: Role.TRAVELER,
  displayPicture: null,
  bio: null,
  phone_number: '0123456789',
  is_verified: true,
  createdAt: now,
  updatedAt: now,
};

const admin: UserResponse = { ...user, role: Role.ADMIN };

const blogInsight: BlogInsight = {
  id: '00000000-0000-0000-0000-000000000100' as UUID,
  blog_id: '00000000-0000-0000-0000-000000000010' as UUID,
  user_id: user.id,
  label: 'Weather',
  data: 'Sunny',
  created_at: now,
  updated_at: now,
};

const createInsightPayload: CreateBlogInsight = {
  label: 'Weather',
  data: 'Sunny',
};

const updateInsightPayload: UpdateBlogInsight = {
  data: 'Rainy',
};

const mockRepo: jest.Mocked<IBlogInsightRepository> = {
  create: jest.fn(),
  getAll: jest.fn(),
  getByBlogId: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
};

describe('BlogInsightService', () => {
  const service = new BlogInsightService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInsight', () => {
    it('creates insight', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue({});
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      mockRepo.create.mockResolvedValue(blogInsight);

      const result = await service.createInsight(user.id, blogInsight.blog_id, createInsightPayload);
      expect(result).toBeInstanceOf(BlogInsightResponseDto);
      expect(mockRepo.create).toHaveBeenCalledWith(user.id, blogInsight.blog_id, createInsightPayload);
    });

    it('throws if blog not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(service.createInsight(user.id, blogInsight.blog_id, createInsightPayload)).rejects.toThrow(NotFoundException);
    });

    it('throws if user not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue({});
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(service.createInsight(user.id, blogInsight.blog_id, createInsightPayload)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllInsights', () => {
    it('returns all insights as DTOs', async () => {
      mockRepo.getAll.mockResolvedValue([blogInsight]);

      const result = await service.getAllInsights();
      expect(result[0]).toBeInstanceOf(BlogInsightResponseDto);
    });
  });

  describe('getInsightByBlogId', () => {
    it('returns insights for a blog', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue({});
      mockRepo.getByBlogId.mockResolvedValue([blogInsight]);

      const result = await service.getInsightByBlogId(blogInsight.blog_id);
      expect(result[0]).toBeInstanceOf(BlogInsightResponseDto);
    });

    it('throws if blog not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(service.getInsightByBlogId(blogInsight.blog_id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getInsightById', () => {
    it('returns insight', async () => {
      mockRepo.getById.mockResolvedValue(blogInsight);

      const result = await service.getInsightById(blogInsight.id);
      expect(result).toBeInstanceOf(BlogInsightResponseDto);
    });

    it('throws if not found', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.getInsightById(blogInsight.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateInsight', () => {
    it('updates as owner', async () => {
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      mockRepo.update.mockResolvedValue({ ...blogInsight, ...updateInsightPayload });

      const result = await service.updateInsight(blogInsight.id, user.id, updateInsightPayload);
      expect(result).toBeInstanceOf(BlogInsightResponseDto);
    });

    it('updates as admin', async () => {
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(admin);
      mockRepo.update.mockResolvedValue({ ...blogInsight, ...updateInsightPayload });

      const result = await service.updateInsight(blogInsight.id, admin.id, updateInsightPayload);
      expect(result).toBeInstanceOf(BlogInsightResponseDto);
    });

    it('throws if user not found', async () => {
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(service.updateInsight(blogInsight.id, user.id, updateInsightPayload)).rejects.toThrow(NotFoundException);
    });

    it('throws if not owner or admin', async () => {
      const stranger = { ...user, id: '00000000-0000-0000-0000-000000099999' as UUID };
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

      await expect(service.updateInsight(blogInsight.id, stranger.id, updateInsightPayload)).rejects.toThrow(ForbiddenException);
    });

    it('throws if insight not found', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.updateInsight(blogInsight.id, user.id, updateInsightPayload)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteInsight', () => {
    it('deletes as owner', async () => {
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(user);

      await service.deleteInsight(blogInsight.id, user.id);
      expect(mockRepo.delete).toHaveBeenCalledWith(blogInsight.id);
    });

    it('deletes as admin', async () => {
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(admin);

      await service.deleteInsight(blogInsight.id, admin.id);
      expect(mockRepo.delete).toHaveBeenCalledWith(blogInsight.id);
    });

    it('throws if not owner or admin', async () => {
      const stranger = { ...user, id: '00000000-0000-0000-0000-000000099999' as UUID };
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

      await expect(service.deleteInsight(blogInsight.id, stranger.id)).rejects.toThrow(ForbiddenException);
    });

    it('throws if insight not found', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.deleteInsight(blogInsight.id, user.id)).rejects.toThrow(NotFoundException);
    });

    it('throws if user not found', async () => {
      mockRepo.getById.mockResolvedValue(blogInsight);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteInsight(blogInsight.id, user.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchInsights', () => {
    it('returns matching results', async () => {
      mockRepo.search.mockResolvedValue([blogInsight]);

      const result = await service.searchInsights({ label: 'Weather' });
      expect(result[0]).toBeInstanceOf(BlogInsightResponseDto);
    });
  });
});
