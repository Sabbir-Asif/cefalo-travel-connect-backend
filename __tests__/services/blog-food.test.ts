import { BlogFoodService } from '../../src/services/blog-food';
import { IBlogFoodRepository } from '../../src/repositories/blog-food';
import { UUID } from 'crypto';
import { BlogFoodDto } from '../../src/dtos/blog-food';
import { FoodResponseDto } from '../../src/dtos/food';
import { Blog_Status, Blog } from '../../src/interfaces/blog';
import { Food } from '../../src/interfaces/food';
import { NotFoundException } from '../../src/exceptions/not-found';
import { blogService } from '../../src/controllers/blog';
import { foodService } from '../../src/controllers/food';

jest.mock('../../src/controllers/blog');
jest.mock('../../src/controllers/food');

const mockRepo: jest.Mocked<IBlogFoodRepository> = {
  create: jest.fn(),
  delete: jest.fn(),
  foodsForBlog: jest.fn(),
};

const now = new Date();

const blog: Blog = {
  id: '00000000-0000-0000-0000-000000000001' as UUID,
  userId: '00000000-0000-0000-0000-000000000010' as UUID,
  title: 'Food Blog',
  locationName: 'Dhaka',
  location_points: { lat: 23.8, long: 90.4 },
  description: 'Best foods',
  cover_image: null,
  status: Blog_Status.PUBLISHED,
  tags: ['food', 'dhaka'],
  images: [],
  videos: [],
  created_at: now,
  updated_at: now,
};

const food: Food = {
  id: '00000000-0000-0000-0000-000000000100' as UUID,
  name: 'Biriyani',
  category: 'Main Course',
  provider: 'Star Hotel',
  location: 'Banani',
  created_at: now,
  updated_at: now,
};

describe('BlogFoodService', () => {
  const service = new BlogFoodService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBlogfood', () => {
    it('should create blog food entry', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(blog);
      (foodService.getFoodById as jest.Mock).mockResolvedValue(food);
      mockRepo.create.mockResolvedValue({ blog_id: blog.id, food_id: food.id });

      const result = await service.createBlogfood(blog.id, food.id);

      expect(result).toBeInstanceOf(BlogFoodDto);
      expect(mockRepo.create).toHaveBeenCalledWith(blog.id, food.id);
    });

    it('should throw if blog not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(service.createBlogfood(blog.id, food.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw if food not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(blog);
      (foodService.getFoodById as jest.Mock).mockResolvedValue(null);

      await expect(service.createBlogfood(blog.id, food.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBlogFood', () => {
    it('should delete blog food entry', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(blog);
      (foodService.getFoodById as jest.Mock).mockResolvedValue(food);
      mockRepo.delete.mockResolvedValue(1);

      const result = await service.deleteBlogFood(blog.id, food.id);

      expect(result).toBe(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(blog.id, food.id);
    });

    it('should throw if blog not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteBlogFood(blog.id, food.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw if food not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(blog);
      (foodService.getFoodById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteBlogFood(blog.id, food.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw if delete count is 0 (not found)', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(blog);
      (foodService.getFoodById as jest.Mock).mockResolvedValue(food);
      mockRepo.delete.mockResolvedValue(0);

      await expect(service.deleteBlogFood(blog.id, food.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFoodsForBlog', () => {
    it('should return list of food response DTOs', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(blog);
      mockRepo.foodsForBlog.mockResolvedValue([food]);

      const result = await service.getFoodsForBlog(blog.id);

      expect(result[0]).toBeInstanceOf(FoodResponseDto);
      expect(mockRepo.foodsForBlog).toHaveBeenCalledWith(blog.id);
    });

    it('should throw if blog not found', async () => {
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(service.getFoodsForBlog(blog.id)).rejects.toThrow(NotFoundException);
    });
  });
});
