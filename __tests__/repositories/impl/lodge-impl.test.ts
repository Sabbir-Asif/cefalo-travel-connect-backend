import { LodgeRepository } from '../../../src/infrastructure/lodge-impl';
import { UUID } from 'crypto';
import { db } from '../../../src/configs/db';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn((sql: string, bindings?: any[]) => ({ __raw: true, sql, bindings }));
    return { db: mDb };
});

describe('LodgeRepository', () => {
    const repository = new LodgeRepository();
    const mockDb = db as jest.MockedFunction<any>;
    const lodgeId = 'lodge-uuid' as UUID;

    const baseLodge = {
        id: lodgeId,
        name: 'Test Lodge',
        location_name: 'Chattogram',
        price: 1500,
        description: 'Nice stay',
        cover_image: 'image.jpg',
        lat: '23.8',
        long: '90.4',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return lodge with location points', async () => {
            mockDb.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([baseLodge]),
                }),
            });

            const result = await repository.create({
                name: baseLodge.name,
                location_name: baseLodge.location_name,
                location_point: { lat: 23.8, long: 90.4 },
                price: baseLodge.price,
                description: baseLodge.description,
                cover_image: baseLodge.cover_image,
            });

            expect(result.location_point).toEqual({
                lat: parseFloat(baseLodge.lat),
                long: parseFloat(baseLodge.long),
            });
        });
    });

    describe('getAll', () => {
        it('should return all lodges with parsed location', async () => {
            mockDb.mockReturnValue({
                select: jest.fn().mockResolvedValue([baseLodge])
            });

            const result = await repository.getAll();
            expect(result[0].location_point).toEqual({
                lat: parseFloat(baseLodge.lat),
                long: parseFloat(baseLodge.long),
            });
        });
    });

    describe('getById', () => {
        it('should return lodge by id', async () => {
            mockDb.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        first: jest.fn().mockResolvedValue(baseLodge),
                    }),
                })
            });

            const result = await repository.getById(lodgeId);
            expect(result?.id).toBe(lodgeId);
        });
    });

    describe('update', () => {
        it('should update lodge and return new data', async () => {
            mockDb.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    update: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([baseLodge]),
                    })
                })
            });

            const result = await repository.update(lodgeId, {
                name: 'Updated Name',
                location_name: baseLodge.location_name,
                location_point: { lat: 23.8, long: 90.4 },
                price: 1700,
                description: 'Updated description',
                cover_image: 'new.jpg'
            });

            expect(result.name).toBe('Test Lodge'); // mocked return value
        });
    });

    describe('delete', () => {
        it('should delete lodge by id', async () => {
            mockDb.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    del: jest.fn().mockResolvedValue(1)
                })
            });

            await expect(repository.delete(lodgeId)).resolves.toBeUndefined();
        });
    });

    describe('allLocations', () => {
        it('should return distinct lodge locations', async () => {
            mockDb.mockReturnValue({
                distinct: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue([{ name: 'Dhaka', lat: '23.7', long: '90.4' }])
                })
            });

            const result = await repository.allLocations();
            expect(result).toEqual([
                {
                    name: 'Dhaka',
                    location_point: { lat: 23.7, long: 90.4 },
                },
            ]);
        });
    });

    describe('search', () => {
        it('should filter and return matched lodges', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (cb: any) => cb([baseLodge]),
            };

            mockDb.mockReturnValue(mockQuery);

            const result = await repository.search({ name: 'Test', sortBy: 'price', order: 'asc' });

            expect(result[0].name).toBe('Test Lodge');
            expect(mockQuery.whereILike).toHaveBeenCalledWith('name', '%Test%');
            expect(mockQuery.orderBy).toHaveBeenCalledWith('price', 'asc');
        });

        it('should return empty array if no matches', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (cb: any) => cb([]),
            };

            mockDb.mockReturnValue(mockQuery);

            const result = await repository.search({ name: 'NoMatch' });

            expect(result).toEqual([]);
        });

        it('should handle multiple filters', async () => {
            const mockQuery = {
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (cb: any) => cb([baseLodge]),
            };

            mockDb.mockReturnValue(mockQuery);

            const result = await repository.search({
                name: 'Test',
                location_name: 'Chattogram',
                priceMin: 1000,
                priceMax: 2000,
                sortBy: 'name',
                order: 'desc',
            });

            expect(result[0].name).toBe('Test Lodge');
            expect(mockQuery.whereILike).toHaveBeenCalledWith('name', '%Test%');
            expect(mockQuery.whereILike).toHaveBeenCalledWith('location_name', '%Chattogram%');
            expect(mockQuery.where).toHaveBeenCalledWith('price', '>=', 1000);
            expect(mockQuery.where).toHaveBeenCalledWith('price', '<=', 2000);
            expect(mockQuery.orderBy).toHaveBeenCalledWith('name', 'desc');
        });

    });

});
