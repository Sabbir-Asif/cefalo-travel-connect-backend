import { BlogLodgeService } from '../../src/services/blog-lodge';
import { IBlogLodgeRepository } from '../../src/repositories/blog-lodge';
import { UUID } from 'crypto';
import { BlogLodge } from '../../src/interfaces/blog-lodge';
import { Lodge } from '../../src/interfaces/lodge';
import { blogService } from '../../src/controllers/blog';
import { lodgeService } from '../../src/controllers/lodge';
import { NotFoundException } from '../../src/exceptions/not-found';

jest.mock('../../src/controllers/blog');
jest.mock('../../src/controllers/lodge');

const mockRepo: jest.Mocked<IBlogLodgeRepository> = {
  create: jest.fn(),
  delete: jest.fn(),
  lodgesForBlog: jest.fn(),
};

const blogId = '00000000-0000-0000-0000-000000000001' as UUID;
const lodgeId = '00000000-0000-0000-0000-000000000002' as UUID;
const now = new Date();

const lodge: Lodge = {
  id: lodgeId,
  name: 'Cozy Lodge',
  location_name: 'Sreemangal',
  location_point: { lat: 24.3, long: 91.8 },
  price: 3000,
  description: 'Nice place',
  cover_image: 'cover-image',
  created_at: now,
  updated_at: now,
};

const blogLodge: BlogLodge = {
  blog_id: blogId,
  lodge_id: lodgeId,
};

describe('BlogLodgeService', () => {
  const service = new BlogLodgeService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBlogLodge', () => {
    it('creates blog-lodge entry', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue({});
      (lodgeService.getLodgeById as jest.Mock).mockResolvedValue({});
      mockRepo.create.mockResolvedValue(blogLodge);

      const result = await service.createBlogLodge(blogId, lodgeId);

      expect(result.blog_id).toBe(blogId);
      expect(result.lodge_id).toBe(lodgeId);
      expect(mockRepo.create).toHaveBeenCalledWith(blogId, lodgeId);
    });

    it('throws if blog not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(service.createBlogLodge(blogId, lodgeId)).rejects.toThrow(NotFoundException);
    });

    it('throws if lodge not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue({});
      (lodgeService.getLodgeById as jest.Mock).mockResolvedValue(null);

      await expect(service.createBlogLodge(blogId, lodgeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBlogLodge', () => {
    it('deletes blog-lodge entry', async () => {
      mockRepo.delete.mockResolvedValue(1);

      const result = await service.deleteBlogLodge(blogId, lodgeId);

      expect(result).toBe(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(blogId, lodgeId);
    });
  });

  describe('getLodgesForBlog', () => {
    it('returns list of lodges', async () => {
      mockRepo.lodgesForBlog.mockResolvedValue([lodge]);

      const result = await service.getLodgesForBlog(blogId);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(lodgeId);
      expect(result[0].name).toBe(lodge.name);
      expect(result[0]).toHaveProperty('location_point');
    });
  });
});
