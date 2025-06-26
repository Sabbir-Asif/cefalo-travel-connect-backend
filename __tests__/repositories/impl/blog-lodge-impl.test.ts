import { BlogLodgeRepository } from '../../../src/repositories/impl/blog-lodge-impl';
import { BlogLodge } from '../../../src/interfaces/blog-lodge';
import { Lodge } from '../../../src/interfaces/lodge';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn().mockImplementation((...args) => ({ __raw: true, sql: args[0], bindings: args[1] }));
    return {
        db: mDb
    };
});
import { db } from '../../../src/configs/db';

describe('BlogLodgeRepository', () => {
    let blogLodgeRepository: BlogLodgeRepository;
    let mockDb: jest.MockedFunction<any>;

    const blogId = 'blog-id-123' as UUID;
    const lodgeId = 'lodge-id-456' as UUID;
    
    const mockBlogLodgeRow = {
        blog_id: blogId,
        lodge_id: lodgeId
    };

    const expectedBlogLodge: BlogLodge = {
        blog_id: blogId,
        lodge_id: lodgeId
    };

    const mockLodgeRow = {
        id: lodgeId,
        name: 'Sunset Resort',
        location_name: 'Maldives',
        price: 299.99,
        description: 'Beautiful beachfront resort with stunning sunset views',
        cover_image: 'sunset-resort.jpg',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        lat: '4.1755',
        long: '73.5093'
    };

    const expectedLodge: Lodge = {
        id: lodgeId,
        name: 'Sunset Resort',
        location_name: 'Maldives',
        location_point: {
            lat: 4.1755,
            long: 73.5093
        },
        price: 299.99,
        description: 'Beautiful beachfront resort with stunning sunset views',
        cover_image: 'sunset-resort.jpg',
        created_at: new Date(mockLodgeRow.created_at),
        updated_at: new Date(mockLodgeRow.updated_at)
    };

    beforeEach(() => {
        blogLodgeRepository = new BlogLodgeRepository();
        mockDb = db as jest.MockedFunction<any>;
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return the created blog-lodge relationship', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockBlogLodgeRow]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await blogLodgeRepository.create(blogId, lodgeId);

            expect(mockDb).toHaveBeenCalledWith('blog_lodges');
            expect(mockInsert).toHaveBeenCalledWith({ 
                blog_id: blogId, 
                lodge_id: lodgeId 
            });
            expect(mockReturning).toHaveBeenCalledWith('*');
            expect(result).toEqual(expectedBlogLodge);
        });
    });

    describe('delete', () => {
        it('should delete the blog-lodge relationship and return count', async () => {
            const mockDel = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogLodgeRepository.delete(blogId, lodgeId);

            expect(mockDb).toHaveBeenCalledWith('blog_lodges');
            expect(mockWhere).toHaveBeenCalledWith({ 
                blog_id: blogId, 
                lodge_id: lodgeId 
            });
            expect(mockDel).toHaveBeenCalled();
            expect(result).toBe(1);
        });

        it('should return 0 if no relationship exists', async () => {
            const mockDel = jest.fn().mockResolvedValue(0);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogLodgeRepository.delete(blogId, 'non-existent-lodge-id' as UUID);

            expect(result).toBe(0);
        });
    });

    describe('lodgesForBlog', () => {
        it('should return all lodges for a blog with parsed location and dates', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockLodgeRow]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogLodgeRepository.lodgesForBlog(blogId);

            expect(mockDb).toHaveBeenCalledWith('blog_lodges');
            expect(mockJoin).toHaveBeenCalledWith('lodges', 'blog_lodges.lodge_id', 'lodges.id');
            expect(mockWhere).toHaveBeenCalledWith('blog_lodges.blog_id', blogId);
            expect(mockSelect).toHaveBeenCalledWith(
                'lodges.*',
                expect.objectContaining({ __raw: true }),
                expect.objectContaining({ __raw: true })
            );
            expect(result).toEqual([expectedLodge]);
        });

        it('should return empty array if no lodges found for blog', async () => {
            const mockSelect = jest.fn().mockResolvedValue([]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogLodgeRepository.lodgesForBlog('non-existent-blog-id' as UUID);

            expect(result).toEqual([]);
        });

        it('should handle multiple lodges for a blog', async () => {
            const mockLodgeRow2 = {
                ...mockLodgeRow,
                id: 'lodge-id-789' as UUID,
                name: 'Mountain View Lodge',
                location_name: 'Swiss Alps',
                price: 199.99,
                lat: '46.5197',
                long: '7.4815'
            };

            const expectedLodge2: Lodge = {
                ...expectedLodge,
                id: 'lodge-id-789' as UUID,
                name: 'Mountain View Lodge',
                location_name: 'Swiss Alps',
                location_point: {
                    lat: 46.5197,
                    long: 7.4815
                },
                price: 199.99
            };

            const mockSelect = jest.fn().mockResolvedValue([mockLodgeRow, mockLodgeRow2]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogLodgeRepository.lodgesForBlog(blogId);

            expect(result).toEqual([expectedLodge, expectedLodge2]);
        });

        it('should properly parse location coordinates from strings to numbers', async () => {
            const mockLodgeWithStringCoords = {
                ...mockLodgeRow,
                lat: '25.2048',
                long: '55.2708'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockLodgeWithStringCoords]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogLodgeRepository.lodgesForBlog(blogId);

            expect(result[0].location_point.lat).toBe(25.2048);
            expect(result[0].location_point.long).toBe(55.2708);
            expect(typeof result[0].location_point.lat).toBe('number');
            expect(typeof result[0].location_point.long).toBe('number');
        });

        it('should properly parse date fields', async () => {
            const mockLodgeWithDifferentDates = {
                ...mockLodgeRow,
                created_at: '2023-06-15T10:30:00.000Z',
                updated_at: '2023-06-20T14:45:00.000Z'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockLodgeWithDifferentDates]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogLodgeRepository.lodgesForBlog(blogId);

            expect(result[0].created_at).toEqual(new Date('2023-06-15T10:30:00.000Z'));
            expect(result[0].updated_at).toEqual(new Date('2023-06-20T14:45:00.000Z'));
        });

        it('should handle lodges with optional fields (description and cover_image)', async () => {
            const mockLodgeWithoutOptionalFields = {
                ...mockLodgeRow,
                description: undefined,
                cover_image: undefined
            };

            const expectedLodgeWithoutOptionals: Lodge = {
                ...expectedLodge,
                description: undefined,
                cover_image: undefined
            };

            const mockSelect = jest.fn().mockResolvedValue([mockLodgeWithoutOptionalFields]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogLodgeRepository.lodgesForBlog(blogId);

            expect(result).toEqual([expectedLodgeWithoutOptionals]);
        });

        it('should handle zero coordinates correctly', async () => {
            const mockLodgeWithZeroCoords = {
                ...mockLodgeRow,
                lat: '0',
                long: '0'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockLodgeWithZeroCoords]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogLodgeRepository.lodgesForBlog(blogId);

            expect(result[0].location_point.lat).toBe(0);
            expect(result[0].location_point.long).toBe(0);
        });

        it('should use PostGIS ST_X and ST_Y functions correctly', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockLodgeRow]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            await blogLodgeRepository.lodgesForBlog(blogId);

            expect(db.raw).toHaveBeenCalledWith('ST_X(lodges.location_point::geometry) as long');
            expect(db.raw).toHaveBeenCalledWith('ST_Y(lodges.location_point::geometry) as lat');
        });
    });
});