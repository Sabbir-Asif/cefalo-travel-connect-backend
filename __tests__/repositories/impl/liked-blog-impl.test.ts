import { LikedBlogRepository } from '../../../src/infrastructure/liked-blog-impl';
import { LikedBlog, BlogReaction } from '../../../src/interfaces/liked-blog';
import { UUID } from 'crypto';
import { db } from '../../../src/configs/db';
import { Role, User } from '../../../src/interfaces/user';
import { Blog } from '../../../src/interfaces/blog';

jest.mock('../../../src/configs/db', () => {
  const mDb: any = jest.fn();
  mDb.raw = jest.fn((sql: string) => ({ __raw: true, sql }));
  return { db: mDb };
});

describe('LikedBlogRepository', () => {
  const repository = new LikedBlogRepository();
  const mockDb = db as jest.MockedFunction<any>;

  const userId = 'user-uuid' as UUID;
  const blogId = 'blog-uuid' as UUID;

  const mockLikedBlogRow = {
    user_id: userId,
    blog_id: blogId,
    reaction_name: BlogReaction.Curious,
    created_at: '2024-01-01T00:00:00.000Z',
  };

  const mockUser: User = {
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    password: '',
    phone_number: '',
    role: Role.TRAVELER,
    displayPicture: null,
    bio: null,
    is_verified: true,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockBlog: any = {
    id: blogId,
    userId: userId,
    title: 'Sample Blog',
    description: 'Description',
    tags: JSON.stringify(['tag1']),
    images: JSON.stringify(['img1']),
    videos: JSON.stringify(['vid1']),
    locationName: '',
    long: '90.4125',
    lat: '23.8103',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return liked blog', async () => {
      mockDb.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockLikedBlogRow])
        })
      });

      const result = await repository.create({
        user_id: userId,
        blog_id: blogId,
        reaction_name: BlogReaction.Curious,
      });

      expect(result).toEqual({
        ...mockLikedBlogRow,
        created_at: new Date(mockLikedBlogRow.created_at),
      });
    });
  });

  describe('delete', () => {
    it('should delete the like entry', async () => {
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        })
      });

      const result = await repository.delete(userId, blogId);
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('should update the reaction and return result', async () => {
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockLikedBlogRow]),
          }),
        }),
      });

      const result = await repository.update({
        user_id: userId,
        blog_id: blogId,
        reaction_name: BlogReaction.Curious,
      });

      expect(result).toEqual({
        ...mockLikedBlogRow,
        created_at: new Date(mockLikedBlogRow.created_at),
      });
    });
  });

  describe('findByUserAndBlog', () => {
    it('should return like record by user and blog', async () => {
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([mockLikedBlogRow]),
        })
      });

      const result = await repository.findByUserAndBlog(userId, blogId);

      expect(result).toEqual({
        ...mockLikedBlogRow,
        created_at: new Date(mockLikedBlogRow.created_at),
      });
    });
  });

  describe('usersForBlog', () => {
    it('should return users who liked a blog', async () => {
      mockDb.mockReturnValue({
        join: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([{
              ...mockUser,
              createdAt: mockUser.createdAt.toISOString(),
              updatedAt: mockUser.updatedAt.toISOString(),
            }]),
          }),
        }),
      });

      const result = await repository.usersForBlog(blogId);

      expect(result).toEqual([{
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt),
      }]);
    });
  });

  describe('blogsForUser', () => {
    it('should return blogs liked by a user', async () => {
      mockDb.mockReturnValue({
        join: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([mockBlog]),
          })
        }),
      });

      const result = await repository.blogsForUser(userId);

      expect(result).toEqual([{
        ...mockBlog,
        tags: ['tag1'],
        images: ['img1'],
        videos: ['vid1'],
        location_points: {
          lat: parseFloat(mockBlog.lat),
          long: parseFloat(mockBlog.long),
        },
        created_at: new Date(mockBlog.created_at),
        updated_at: new Date(mockBlog.updated_at),
      }]);
    });
  });
});