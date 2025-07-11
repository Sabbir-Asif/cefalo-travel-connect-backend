import { BlogRepository } from '../../../src/infrastructure/blog-impl';
import { CreateBlog, Blog, UpdateBlog, Blog_Status } from '../../../src/interfaces/blog';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn().mockImplementation((...args) => ({ __raw: true, sql: args[0], bindings: args[1] }));
    return {
        db: mDb
    };
});
import { db } from '../../../src/configs/db';

describe('BlogRepository', () => {
    let blogRepository: BlogRepository;
    let mockDb: jest.MockedFunction<any>;

    const blogId = 'blog-id-123' as UUID;
    const mockBlogRow = {
        id: blogId,
        userId: 'user-id-1',
        title: 'Test Blog',
        description: 'Sample content',
        tags: JSON.stringify(['travel', 'nature']),
        images: JSON.stringify(['img1.jpg']),
        videos: JSON.stringify(['vid1.mp4']),
        lat: '23.8103',
        long: '90.4125',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    const expectedBlog: Blog = {
        id: blogId,
        userId: mockBlogRow.userId as UUID,
        title: 'Test Blog',
        locationName: '',
        location_points: {
            lat: 23.8103,
            long: 90.4125
        },
        description: 'Sample content',
        cover_image: null,
        status: Blog_Status.DRAFT,
        tags: ['travel', 'nature'],
        images: ['img1.jpg'],
        videos: ['vid1.mp4'],
        created_at: new Date(mockBlogRow.created_at),
        updated_at: new Date(mockBlogRow.updated_at)
    };
    const mockCreate: CreateBlog = {
        title: 'Test Blog',
        description: 'Sample content',
        tags: ['travel', 'nature'],
        images: ['img1.jpg'],
        videos: ['vid1.mp4'],
        location_points: { lat: 23.8103, long: 90.4125 },
        locationName: ''
    };

    beforeEach(() => {
        blogRepository = new BlogRepository();
        mockDb = db as jest.MockedFunction<any>;
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return the created blog', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockBlogRow]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await blogRepository.create('user-id-1' as UUID, mockCreate);

            expect(mockDb).toHaveBeenCalledWith('blogs');
            expect(mockInsert).toHaveBeenCalled();
            expect(mockReturning).toHaveBeenCalledWith([
                '*',
                expect.anything(),
                expect.anything()
            ]);
            expect(result).toEqual(expectedBlog);
        });
    });

    describe('getAll', () => {
        it('should return all blogs with parsed location', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockBlogRow]);
            mockDb.mockReturnValue({ select: mockSelect });

            const result = await blogRepository.getAll();

            expect(mockDb).toHaveBeenCalledWith('blogs');
            expect(mockSelect).toHaveBeenCalled();
            expect(result).toEqual([expectedBlog]);
        });
    });

    describe('getById', () => {
        it('should return blog by id', async () => {
            const mockFirst = jest.fn().mockResolvedValue(mockBlogRow);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            const mockSelect = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ select: mockSelect });

            const result = await blogRepository.getById(blogId);

            expect(mockDb).toHaveBeenCalledWith('blogs');
            expect(result).toEqual(expectedBlog);
        });

        it('should return null if not found', async () => {
            const mockFirst = jest.fn().mockResolvedValue(null);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            const mockSelect = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ select: mockSelect });

            const result = await blogRepository.getById('non-existent-id' as UUID);

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update the blog and return updated result', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockBlogRow]);
            const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogRepository.update(blogId, {
                title: 'Updated title',
                location_points: { lat: 23.8103, long: 90.4125 }
            });

            expect(mockDb).toHaveBeenCalledWith('blogs');
            expect(mockReturning).toHaveBeenCalledWith([
                '*',
                expect.anything(),
                expect.anything()
            ]);
            expect(result).toEqual(expectedBlog);
        });
    });

    describe('delete', () => {
        it('should delete the blog and return count', async () => {
            const mockDel = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogRepository.delete(blogId);

            expect(mockDb).toHaveBeenCalledWith('blogs');
            expect(result).toBe(1);
        });
    });

    describe('search', () => {
        it('should search by fields and return blogs', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                whereIn: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                whereRaw: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockBlogRow]),
                select: jest.fn().mockReturnThis()
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogRepository.search({
                title: 'Test',
                userId: 'user-id-1',
                id: [blogId],
                lat: '23.8103',
                long: '90.4125'
            });

            expect(result).toEqual([expectedBlog]);
        });

        it('should return all blogs if no filters are applied', async () => {
            const mockQuery = {
                then: (fn: any) => fn([mockBlogRow]),
                select: jest.fn().mockReturnThis()
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogRepository.search({});

            expect(result).toEqual([expectedBlog]);
        });

        it('should handle invalid UUID and not apply filter', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                whereIn: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockBlogRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogRepository.search({ id: ['invalid-uuid'] });

            expect(result).toEqual([expectedBlog]);
        });

        it('should skip lat/long filter if invalid numbers', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockBlogRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogRepository.search({
                lat: 'not-a-number',
                long: 'not-a-number'
            });

            expect(result).toEqual([expectedBlog]);
        });
    });
});
