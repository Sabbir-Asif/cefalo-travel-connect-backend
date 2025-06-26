import { TourLodgeRepository } from '../../../src/repositories/impl/tour-lodge-impl';
import { UUID } from 'crypto';
import { db } from '../../../src/configs/db';

jest.mock('../../../src/configs/db', () => {
  const mDb: any = jest.fn();
  mDb.raw = jest.fn((sql: string, bindings?: any[]) => ({ __raw: true, sql, bindings }));
  return { db: mDb };
});

describe('TourLodgeRepository', () => {
  const repository = new TourLodgeRepository();
  const mockDb = db as jest.MockedFunction<any>;

  const travelplanId = 'travelplan-uuid' as UUID;
  const lodgeId = 'lodge-uuid' as UUID;

  const mockTourLodgeRecord = {
    travelplan_id: travelplanId,
    lodge_id: lodgeId,
  };

  const mockLodgeRow = {
    id: lodgeId,
    name: 'Sample Lodge',
    location_name: 'Test Location',
    price: 1000,
    description: 'Nice place',
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
    it('should insert and return a tour lodge record', async () => {
      mockDb.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockTourLodgeRecord]),
        }),
      });

      const result = await repository.create(travelplanId, lodgeId);

      expect(result).toEqual(mockTourLodgeRecord);
    });
  });

  describe('delete', () => {
    it('should delete a tour lodge record and return number of deleted rows', async () => {
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      });

      const result = await repository.delete(travelplanId, lodgeId);

      expect(result).toBe(1);
    });
  });

  describe('lodgesForTravelPlan', () => {
    it('should return lodges linked to a travel plan with parsed location_point and dates', async () => {
      mockDb.mockReturnValue({
        join: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([mockLodgeRow]),
          }),
        }),
      });

      const result = await repository.lodgesForTravelPlan(travelplanId);

      expect(result).toEqual([
        {
          id: mockLodgeRow.id,
          name: mockLodgeRow.name,
          location_name: mockLodgeRow.location_name,
          price: mockLodgeRow.price,
          description: mockLodgeRow.description,
          cover_image: mockLodgeRow.cover_image,
          location_point: {
            lat: parseFloat(mockLodgeRow.lat),
            long: parseFloat(mockLodgeRow.long),
          },
          created_at: new Date(mockLodgeRow.created_at),
          updated_at: new Date(mockLodgeRow.updated_at),
        },
      ]);
    });
  });
});
