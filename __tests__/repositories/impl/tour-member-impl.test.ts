import { TourMemberRepository } from '../../../src/infrastructure/tour-member-impl';
import { UUID } from 'crypto';
import { db } from '../../../src/configs/db';
import { User, Role } from '../../../src/interfaces/user';

jest.mock('../../../src/configs/db', () => {
  const mDb: any = jest.fn();
  return { db: mDb };
});

describe('TourMemberRepository', () => {
  const repository = new TourMemberRepository();
  const mockDb = db as jest.MockedFunction<any>;

  const travelplanId = 'travelplan-uuid' as UUID;
  const userId = 'user-uuid' as UUID;

  const mockTourMemberRecord = {
    travelplan_id: travelplanId,
    user_id: userId,
  };

  const mockUserRow = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: Role.TRAVELER,
    displayPicture: null,
    bio: null,
    phone_number: '1234567890',
    is_verified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return a tour member record', async () => {
      mockDb.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockTourMemberRecord]),
        }),
      });

      const result = await repository.create(travelplanId, userId);

      expect(result).toEqual(mockTourMemberRecord);
    });
  });

  describe('delete', () => {
    it('should delete a tour member record and return number of deleted rows', async () => {
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnValue({
          del: jest.fn().mockResolvedValue(1),
        }),
      });

      const result = await repository.delete(travelplanId, userId);

      expect(result).toBe(1);
    });
  });

  describe('membersForTravelPlan', () => {
    it('should return users linked to a travel plan with parsed dates', async () => {
      mockDb.mockReturnValue({
        join: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([mockUserRow]),
          }),
        }),
      });

      const result = await repository.membersForTravelPlan(travelplanId);

      expect(result).toEqual([
        {
          ...mockUserRow,
          createdAt: new Date(mockUserRow.createdAt),
          updatedAt: new Date(mockUserRow.updatedAt),
        },
      ]);
    });
  });
});
