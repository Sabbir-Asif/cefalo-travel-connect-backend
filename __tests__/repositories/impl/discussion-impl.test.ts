import { DiscussionRepository } from '../../../src/infrastructure/discussion-impl';
import { CreateDiscussion, Discussion, DiscussionWithSender } from '../../../src/interfaces/discussion';
import { UUID } from 'crypto';
import { Role } from '../../../src/interfaces/user';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn().mockImplementation((sql: string) => ({ __raw: true, sql }));
    return { db: mDb };
});
import { db } from '../../../src/configs/db';

describe('DiscussionRepository', () => {
    let repository: DiscussionRepository;
    let mockDb: jest.MockedFunction<any>;
    const table = 'discussions';

    const discussionId = 'discussion-uuid' as UUID;
    const travelPlanId = 'travel-plan-uuid' as UUID;
    const senderId = 'sender-uuid' as UUID;

    const mockRow = {
        id: discussionId,
        travel_plan_id: travelPlanId,
        sender_id: senderId,
        content: 'Hello world!',
        created_at: '2024-01-01T00:00:00.000Z'
    };

    const mockSender = {
        id: senderId,
        name: 'Sabbir',
        email: 'sabbir@example.com',
        password: 'hashed-password',
        role: Role.TRAVELER,
        displayPicture: null,
        bio: null,
        phone_number: '01234567890',
        is_verified: true,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z')
    };

    const mockRowWithSender = {
        ...mockRow,
        sender: mockSender
    };

    const expectedDiscussion: Discussion = {
        id: discussionId,
        travel_plan_id: travelPlanId,
        sender_id: senderId,
        content: 'Hello world!',
        created_at: new Date(mockRow.created_at)
    };

    const expectedDiscussionWithSender: DiscussionWithSender = {
        ...expectedDiscussion,
        sender: mockSender
    };

    beforeEach(() => {
        repository = new DiscussionRepository();
        mockDb = db as jest.MockedFunction<any>;
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return created discussion', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockRow]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await repository.create(senderId, {
                travel_plan_id: travelPlanId,
                content: 'Hello world!'
            });

            expect(result).toEqual(expectedDiscussion);
        });
    });

    describe('getByTravelPlanId', () => {
        it('should return all discussions for a travel plan', async () => {
            const mockOrderBy = jest.fn().mockResolvedValue([mockRowWithSender]);
            const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
            const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select = mockSelect;

            const result = await repository.getByTravelPlanId(travelPlanId);

            expect(result).toEqual([expectedDiscussionWithSender]);
        });

        it('should return empty array if no discussions found', async () => {
            const mockOrderBy = jest.fn().mockResolvedValue([]);
            const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
            const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select = mockSelect;

            const result = await repository.getByTravelPlanId(travelPlanId);

            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return discussion with sender if found', async () => {
            const mockFirst = jest.fn().mockResolvedValue(mockRowWithSender);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
            const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select = mockSelect;

            const result = await repository.getById(discussionId);

            expect(result).toEqual(expectedDiscussionWithSender);
        });

        it('should return null if discussion not found', async () => {
            const mockFirst = jest.fn().mockResolvedValue(null);
            const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
            const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
            const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
            mockDb.select = mockSelect;

            const result = await repository.getById('non-existent-id' as UUID);

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should delete discussion by id', async () => {
            const mockDel = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
            mockDb.mockReturnValue({ where: mockWhere });

            await repository.delete(discussionId);

            expect(mockDb).toHaveBeenCalledWith(table);
        });
    });

    describe('search', () => {
        it('should return discussions by filters', async () => {
            const mockResults = [mockRowWithSender];

            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                then: (resolve: any) => resolve(mockResults)
            };

            const mockSelect = jest.fn().mockReturnValue(mockQuery);
            mockDb.select = mockSelect;

            const result = await repository.search({
                travel_plan_id: travelPlanId,
                sender_id: senderId,
                content: 'hello',
            });

            expect(result).toEqual(mockResults.map(repository['toModelWithSender']));
        });

        it('should return empty array if no match found', async () => {
            const mockResults: any[] = [];

            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                then: (resolve: any) => resolve(mockResults)
            };

            const mockSelect = jest.fn().mockReturnValue(mockQuery);
            mockDb.select = mockSelect;

            const result = await repository.search({
                content: 'no-match',
            });

            expect(result).toEqual([]);
        });
    });

});
