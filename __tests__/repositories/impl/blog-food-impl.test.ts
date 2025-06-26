import { BlogFoodRepository } from '../../../src/repositories/impl/blog-food-impl';
import { BlogFood } from '../../../src/interfaces/blog-foods';
import { Food } from '../../../src/interfaces/food';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn().mockImplementation((...args) => ({ __raw: true, sql: args[0], bindings: args[1] }));
    return {
        db: mDb
    };
});
import { db } from '../../../src/configs/db';

describe('BlogFoodRepository', () => {
    let blogFoodRepository: BlogFoodRepository;
    let mockDb: jest.MockedFunction<any>;

    const blogId = 'blog-id-123' as UUID;
    const foodId = 'food-id-456' as UUID;
    
    const mockBlogFoodRow = {
        blog_id: blogId,
        food_id: foodId
    };

    const expectedBlogFood: BlogFood = {
        blog_id: blogId,
        food_id: foodId
    };

    const mockFoodRow = {
        id: foodId,
        name: 'Pizza',
        category: 'Main Course',
        provider: 'Italian Restaurant',
        location: 'Downtown',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    const expectedFood: Food = {
        id: foodId,
        name: 'Pizza',
        category: 'Main Course',
        provider: 'Italian Restaurant',
        location: 'Downtown',
        created_at: new Date(mockFoodRow.created_at),
        updated_at: new Date(mockFoodRow.updated_at)
    };

    beforeEach(() => {
        blogFoodRepository = new BlogFoodRepository();
        mockDb = db as jest.MockedFunction<any>;
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return the created blog-food relationship', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockBlogFoodRow]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await blogFoodRepository.create(blogId, foodId);

            expect(mockDb).toHaveBeenCalledWith('blog_foods');
            expect(mockInsert).toHaveBeenCalledWith({ 
                blog_id: blogId, 
                food_id: foodId 
            });
            expect(mockReturning).toHaveBeenCalledWith('*');
            expect(result).toEqual(expectedBlogFood);
        });
    });

    describe('delete', () => {
        it('should delete the blog-food relationship and return count', async () => {
            const mockDel = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogFoodRepository.delete(blogId, foodId);

            expect(mockDb).toHaveBeenCalledWith('blog_foods');
            expect(mockWhere).toHaveBeenCalledWith({ 
                blog_id: blogId, 
                food_id: foodId 
            });
            expect(mockDel).toHaveBeenCalled();
            expect(result).toBe(1);
        });

        it('should return 0 if no relationship exists', async () => {
            const mockDel = jest.fn().mockResolvedValue(0);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogFoodRepository.delete(blogId, 'non-existent-food-id' as UUID);

            expect(result).toBe(0);
        });
    });

    describe('foodsForBlog', () => {
        it('should return all foods for a blog with parsed dates', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockFoodRow]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogFoodRepository.foodsForBlog(blogId);

            expect(mockDb).toHaveBeenCalledWith('blog_foods');
            expect(mockJoin).toHaveBeenCalledWith('foods', 'blog_foods.food_id', 'foods.id');
            expect(mockWhere).toHaveBeenCalledWith('blog_foods.blog_id', blogId);
            expect(mockSelect).toHaveBeenCalledWith('foods.*');
            expect(result).toEqual([expectedFood]);
        });

        it('should return empty array if no foods found for blog', async () => {
            const mockSelect = jest.fn().mockResolvedValue([]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogFoodRepository.foodsForBlog('non-existent-blog-id' as UUID);

            expect(result).toEqual([]);
        });

        it('should handle multiple foods for a blog', async () => {
            const mockFoodRow2 = {
                ...mockFoodRow,
                id: 'food-id-789' as UUID,
                name: 'Burger',
                provider: 'American Diner'
            };

            const expectedFood2: Food = {
                ...expectedFood,
                id: 'food-id-789' as UUID,
                name: 'Burger',
                provider: 'American Diner'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockFoodRow, mockFoodRow2]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogFoodRepository.foodsForBlog(blogId);

            expect(result).toEqual([expectedFood, expectedFood2]);
        });

        it('should properly parse date fields', async () => {
            const mockFoodWithDifferentDates = {
                ...mockFoodRow,
                created_at: '2023-06-15T10:30:00.000Z',
                updated_at: '2023-06-20T14:45:00.000Z'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockFoodWithDifferentDates]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogFoodRepository.foodsForBlog(blogId);

            expect(result[0].created_at).toEqual(new Date('2023-06-15T10:30:00.000Z'));
            expect(result[0].updated_at).toEqual(new Date('2023-06-20T14:45:00.000Z'));
        });
    });
});