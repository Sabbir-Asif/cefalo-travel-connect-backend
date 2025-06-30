import { FoodRepository } from '../../../src/infrastructure/food-impl';
import { CreateFood, Food } from '../../../src/interfaces/food';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => {
  const mDb: any = jest.fn();
  mDb.raw = jest.fn();
  return { db: mDb };
});

import { db } from '../../../src/configs/db';

describe('FoodRepository', () => {
  let repository: FoodRepository;
  let mockDb: jest.MockedFunction<any>;

  const foodId = 'food-id-123' as UUID;
  const mockFoodRow = {
    id: foodId,
    name: 'Pizza',
    category: 'Fast Food',
    provider: 'Dominos',
    location: 'Dhaka',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  };

  const expectedFood: Food = {
    ...mockFoodRow,
    created_at: new Date(mockFoodRow.created_at),
    updated_at: new Date(mockFoodRow.updated_at)
  };

  const mockCreate: CreateFood = {
    name: 'Pizza',
    category: 'Fast Food',
    provider: 'Dominos',
    location: 'Dhaka'
  };

  beforeEach(() => {
    repository = new FoodRepository();
    mockDb = db as jest.MockedFunction<any>;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created food', async () => {
      const mockReturning = jest.fn().mockResolvedValue([mockFoodRow]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.mockReturnValue({ insert: mockInsert });

      const result = await repository.create(mockCreate);

      expect(mockDb).toHaveBeenCalledWith('foods');
      expect(mockInsert).toHaveBeenCalledWith(mockCreate);
      expect(result).toEqual(expectedFood);
    });
  });

  describe('getAll', () => {
    it('should return all food records', async () => {
      const mockSelect = jest.fn().mockResolvedValue([mockFoodRow]);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await repository.getAll();

      expect(mockDb).toHaveBeenCalledWith('foods');
      expect(result).toEqual([expectedFood]);
    });
  });

  describe('getById', () => {
    it('should return food by id', async () => {
      const mockFirst = jest.fn().mockResolvedValue(mockFoodRow);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await repository.getById(foodId);

      expect(mockDb).toHaveBeenCalledWith('foods');
      expect(result).toEqual(expectedFood);
    });

    it('should return null if not found', async () => {
      const mockFirst = jest.fn().mockResolvedValue(null);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await repository.getById('non-existent-id' as UUID);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update food and return updated row', async () => {
      const mockReturning = jest.fn().mockResolvedValue([mockFoodRow]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await repository.update(foodId, {
        name: 'Burger'
      });

      expect(mockDb).toHaveBeenCalledWith('foods');
      expect(result).toEqual(expectedFood);
    });
  });

  describe('delete', () => {
    it('should delete the food by id', async () => {
      const mockDel = jest.fn().mockResolvedValue(1);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      await repository.delete(foodId);

      expect(mockDb).toHaveBeenCalledWith('foods');
      expect(mockDel).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return foods based on filters', async () => {
      const mockQuery = {
        whereILike: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        then: (cb: any) => cb([mockFoodRow])
      };
      mockDb.mockReturnValue(mockQuery);

      const result = await repository.search({ name: 'Pizza' });

      expect(result).toEqual([expectedFood]);
    });

    it('should return empty array if no matches', async () => {
      const mockQuery = {
        whereILike: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        then: (cb: any) => cb([])
      };
      mockDb.mockReturnValue(mockQuery);

      const result = await repository.search({ name: 'NonExistent' });

      expect(result).toEqual([]);
    });
  });
});
