import { BlogInsightRepository } from '../../../src/infrastructure/blog-insight-impl';
import { BlogInsight, CreateBlogInsight, UpdateBlogInsight } from '../../../src/interfaces/blog-insight';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn().mockImplementation((...args) => ({ __raw: true, sql: args[0], bindings: args[1] }));
    return {
        db: mDb
    };
});
import { db } from '../../../src/configs/db';

describe('BlogInsightRepository', () => {
    let blogInsightRepository: BlogInsightRepository;
    let mockDb: jest.MockedFunction<any>;

    const insightId = 'insight-id-123' as UUID;
    const blogId = 'blog-id-456' as UUID;
    const userId = 'user-id-789' as UUID;

    const mockInsightRow = {
        id: insightId,
        blog_id: blogId,
        user_id: userId,
        label: 'Travel Tips',
        data: 'Best places to visit in summer',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    const expectedInsight: BlogInsight = {
        id: insightId,
        blog_id: blogId,
        user_id: userId,
        label: 'Travel Tips',
        data: 'Best places to visit in summer',
        created_at: new Date(mockInsightRow.created_at),
        updated_at: new Date(mockInsightRow.updated_at)
    };

    const mockCreateInsight: CreateBlogInsight = {
        label: 'Travel Tips',
        data: 'Best places to visit in summer'
    };

    const mockUpdateInsight: UpdateBlogInsight = {
        label: 'Updated Travel Tips',
        data: 'Updated best places to visit'
    };

    beforeEach(() => {
        blogInsightRepository = new BlogInsightRepository();
        mockDb = db as jest.MockedFunction<any>;
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return the created blog insight', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockInsightRow]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await blogInsightRepository.create(userId, blogId, mockCreateInsight);

            expect(mockDb).toHaveBeenCalledWith('blog_insights');
            expect(mockInsert).toHaveBeenCalledWith({
                ...mockCreateInsight,
                user_id: userId,
                blog_id: blogId
            });
            expect(mockReturning).toHaveBeenCalledWith('*');
            expect(result).toEqual(expectedInsight);
        });
    });

    describe('getAll', () => {
        it('should return all blog insights with parsed dates', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockInsightRow]);
            mockDb.mockReturnValue({ select: mockSelect });

            const result = await blogInsightRepository.getAll();

            expect(mockDb).toHaveBeenCalledWith('blog_insights');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(result).toEqual([expectedInsight]);
        });

        it('should return empty array when no insights exist', async () => {
            const mockSelect = jest.fn().mockResolvedValue([]);
            mockDb.mockReturnValue({ select: mockSelect });

            const result = await blogInsightRepository.getAll();

            expect(result).toEqual([]);
        });
    });

    describe('getByBlogId', () => {
        it('should return all insights for a specific blog', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockInsightRow]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogInsightRepository.getByBlogId(blogId);

            expect(mockDb).toHaveBeenCalledWith('blog_insights');
            expect(mockWhere).toHaveBeenCalledWith({ blog_id: blogId });
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(result).toEqual([expectedInsight]);
        });

        it('should return empty array when no insights found for blog', async () => {
            const mockSelect = jest.fn().mockResolvedValue([]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogInsightRepository.getByBlogId('non-existent-blog-id' as UUID);

            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return insight by id', async () => {
            const mockFirst = jest.fn().mockResolvedValue(mockInsightRow);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogInsightRepository.getById(insightId);

            expect(mockDb).toHaveBeenCalledWith('blog_insights');
            expect(mockWhere).toHaveBeenCalledWith({ id: insightId });
            expect(mockFirst).toHaveBeenCalledWith('*');
            expect(result).toEqual(expectedInsight);
        });

        it('should return null if insight not found', async () => {
            const mockFirst = jest.fn().mockResolvedValue(null);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogInsightRepository.getById('non-existent-id' as UUID);

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update the insight and return updated result', async () => {
            const updatedRow = {
                ...mockInsightRow,
                label: 'Updated Travel Tips',
                data: 'Updated best places to visit',
                updated_at: '2023-01-02T00:00:00.000Z'
            };

            const mockReturning = jest.fn().mockResolvedValue([updatedRow]);
            const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogInsightRepository.update(insightId, mockUpdateInsight);

            expect(mockDb).toHaveBeenCalledWith('blog_insights');
            expect(mockWhere).toHaveBeenCalledWith({ id: insightId });
            expect(mockUpdate).toHaveBeenCalledWith({
                ...mockUpdateInsight,
                updated_at: expect.any(Date)
            });
            expect(mockReturning).toHaveBeenCalledWith('*');
            expect(result.label).toBe('Updated Travel Tips');
            expect(result.data).toBe('Updated best places to visit');
        });
    });

    describe('delete', () => {
        it('should delete the insight', async () => {
            const mockDel = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
            mockDb.mockReturnValue({ where: mockWhere });

            await blogInsightRepository.delete(insightId);

            expect(mockDb).toHaveBeenCalledWith('blog_insights');
            expect(mockWhere).toHaveBeenCalledWith({ id: insightId });
            expect(mockDel).toHaveBeenCalled();
        });
    });

    describe('search', () => {
        it('should search by label and return insights', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                label: 'Travel'
            });

            expect(mockQuery.whereILike).toHaveBeenCalledWith('label', '%Travel%');
            expect(result).toEqual([expectedInsight]);
        });

        it('should search by data content and return insights', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                data: 'places'
            });

            expect(mockQuery.whereILike).toHaveBeenCalledWith('data', '%places%');
            expect(result).toEqual([expectedInsight]);
        });

        it('should filter by blog_id', async () => {
            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                blog_id: blogId
            });

            expect(mockQuery.where).toHaveBeenCalledWith('blog_id', blogId);
            expect(result).toEqual([expectedInsight]);
        });

        it('should filter by user_id', async () => {
            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                user_id: userId
            });

            expect(mockQuery.where).toHaveBeenCalledWith('user_id', userId);
            expect(result).toEqual([expectedInsight]);
        });

        it('should sort by label in ascending order', async () => {
            const mockQuery = {
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                sortBy: 'label',
                order: 'asc'
            });

            expect(mockQuery.orderBy).toHaveBeenCalledWith('label', 'asc');
            expect(result).toEqual([expectedInsight]);
        });

        it('should sort by created_at in descending order', async () => {
            const mockQuery = {
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                sortBy: 'created_at',
                order: 'desc'
            });

            expect(mockQuery.orderBy).toHaveBeenCalledWith('created_at', 'desc');
            expect(result).toEqual([expectedInsight]);
        });

        it('should use default sorting when no sortBy specified', async () => {
            const mockQuery = {
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({});

            expect(mockQuery.orderBy).toHaveBeenCalledWith('created_at', 'desc');
            expect(result).toEqual([expectedInsight]);
        });

        it('should combine multiple search filters', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([mockInsightRow])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                label: 'Travel',
                data: 'places',
                blog_id: blogId,
                user_id: userId,
                sortBy: 'label',
                order: 'asc'
            });

            expect(mockQuery.whereILike).toHaveBeenCalledWith('label', '%Travel%');
            expect(mockQuery.whereILike).toHaveBeenCalledWith('data', '%places%');
            expect(mockQuery.where).toHaveBeenCalledWith('blog_id', blogId);
            expect(mockQuery.where).toHaveBeenCalledWith('user_id', userId);
            expect(mockQuery.orderBy).toHaveBeenCalledWith('label', 'asc');
            expect(result).toEqual([expectedInsight]);
        });

        it('should return empty array when no results match search criteria', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (fn: any) => fn([])
            };
            mockDb.mockReturnValue(mockQuery);

            const result = await blogInsightRepository.search({
                label: 'NonExistent'
            });

            expect(result).toEqual([]);
        });
    });
});