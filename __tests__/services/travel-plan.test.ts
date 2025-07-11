// __tests__/services/travel-plan.test.ts
import { TravelPlanService } from '../../src/services/travel-plan';
import { ITravelPlanRepository } from '../../src/repositories/travel-plan';
import {
    TravelPlan,
    CreateTravelPlan,
    UpdateTravelPlan,
    TravelPlanStatus,
} from '../../src/interfaces/travel-plan';
import { Role, UserResponse } from '../../src/interfaces/user';
import { TravelPlanResponseDto } from '../../src/dtos/travel-plan';
import { NotFoundException } from '../../src/exceptions/not-found';
import { ForbiddenException } from '../../src/exceptions/forbidden';
import { userService } from '../../src/controllers/user';
import { UUID } from 'crypto';

jest.mock('../../src/controllers/user');

const mockRepo: jest.Mocked<ITravelPlanRepository> = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
};

const now = new Date();

const user: UserResponse = {
    id: '00000000-0000-0000-0000-000000000010' as UUID,
    name: 'Alice',
    email: 'alice@example.com',
    role: Role.TRAVELER,
    displayPicture: null,
    bio: null,
    phone_number: '123456',
    is_verified: true,
    createdAt: now,
    updatedAt: now,
};

const admin: UserResponse = {
    ...user,
    id: '00000000-0000-0000-0000-000000000011' as UUID,
    role: Role.ADMIN,
};

const createPayload: CreateTravelPlan = {
    title: 'Sajek Trip',
    starting_point_name: 'Dhaka',
    starting_point_location: { lat: 23.8, long: 90.4 },
    destination_name: 'Sajek',
    destination_location: { lat: 23.3, long: 92.0 },
    starting_date: new Date('2030-01-05'),
    ending_date: new Date('2030-01-08'),
    budget: 15000,
    description: 'Group tour',
};

const basePlan: TravelPlan = {
    id: '00000000-0000-0000-0000-000000000100' as UUID,
    planner_id: user.id,
    ...createPayload,
    starting_date: new Date(createPayload.starting_date),
    ending_date: new Date(createPayload.ending_date),
    status: TravelPlanStatus.PENDING,
    created_at: now,
    updated_at: now,
};

describe('TravelPlanService', () => {
    const service = new TravelPlanService(mockRepo);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTravelPlan', () => {
        it('creates travel plan', async () => {
            (userService.getUserById as jest.Mock).mockResolvedValue(user);
            mockRepo.create.mockResolvedValue(basePlan);

            const res = await service.createTravelPlan(user.id, createPayload);

            expect(res).toBeInstanceOf(TravelPlanResponseDto);
            expect(mockRepo.create).toHaveBeenCalledWith(user.id, createPayload);
        });

        it('throws when user missing', async () => {
            (userService.getUserById as jest.Mock).mockResolvedValue(null);

            await expect(
                service.createTravelPlan('ghost' as UUID, createPayload),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAllTravelPlans', () => {
        it('returns DTO list', async () => {
            mockRepo.getAll.mockResolvedValue([basePlan]);

            const res = await service.getAllTravelPlans();

            expect(res[0]).toBeInstanceOf(TravelPlanResponseDto);
        });
    });

    describe('getTravelPlanById', () => {
        it('returns DTO when found', async () => {
            mockRepo.getById.mockResolvedValue(basePlan);

            const res = await service.getTravelPlanById(basePlan.id);

            expect(res).toBeInstanceOf(TravelPlanResponseDto);
        });

        it('throws when not found', async () => {
            mockRepo.getById.mockResolvedValue(null);

            await expect(
                service.getTravelPlanById('missing' as UUID),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTravelPlan', () => {
        const upd: UpdateTravelPlan = { title: 'Updated' };

        it('owner updates', async () => {
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(user);

            mockRepo.update.mockResolvedValue({
                ...basePlan,
                ...upd,
                starting_date: basePlan.starting_date,
                ending_date: basePlan.ending_date,
            });

            const res = await service.updateTravelPlan(basePlan.id, user.id, upd);

            expect(res).toBeInstanceOf(TravelPlanResponseDto);
            expect(mockRepo.update).toHaveBeenCalledWith(basePlan.id, upd);
        });

        it('admin updates', async () => {
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(admin);

            mockRepo.update.mockResolvedValue({
                ...basePlan,
                ...upd,
                starting_date: basePlan.starting_date,
                ending_date: basePlan.ending_date,
            });

            await service.updateTravelPlan(basePlan.id, admin.id, upd);

            expect(mockRepo.update).toHaveBeenCalled();
        });

        it('forbidden for others', async () => {
            const stranger = { ...user, id: '00000000-0000-0000-0000-000000000012' as UUID };
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

            await expect(
                service.updateTravelPlan(basePlan.id, stranger.id, upd),
            ).rejects.toThrow(ForbiddenException);
        });

        it('throws when plan missing', async () => {
            mockRepo.getById.mockResolvedValue(null);

            await expect(
                service.updateTravelPlan('bad' as UUID, user.id, upd),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws when user missing', async () => {
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(null);

            await expect(
                service.updateTravelPlan(basePlan.id, 'ghost' as UUID, upd),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteTravelPlan', () => {
        it('owner deletes', async () => {
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(user);

            await service.deleteTravelPlan(basePlan.id, user.id);

            expect(mockRepo.delete).toHaveBeenCalledWith(basePlan.id);
        });

        it('admin deletes', async () => {
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(admin);

            await service.deleteTravelPlan(basePlan.id, admin.id);

            expect(mockRepo.delete).toHaveBeenCalledWith(basePlan.id);
        });

        it('forbidden for others', async () => {
            const stranger = { ...user, id: '00000000-0000-0000-0000-000000000013' as UUID };
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

            await expect(
                service.deleteTravelPlan(basePlan.id, stranger.id),
            ).rejects.toThrow(ForbiddenException);
        });

        it('throws when plan missing', async () => {
            mockRepo.getById.mockResolvedValue(null);

            await expect(
                service.deleteTravelPlan('missing' as UUID, user.id),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws when user missing', async () => {
            mockRepo.getById.mockResolvedValue(basePlan);
            (userService.getUserById as jest.Mock).mockResolvedValue(null);

            await expect(
                service.deleteTravelPlan(basePlan.id, 'ghost' as UUID),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('searchTravelPlans', () => {
        it('maps results', async () => {
            mockRepo.search.mockResolvedValue([basePlan]);

            const res = await service.searchTravelPlans({ q: 'Sajek' });

            expect(res[0]).toBeInstanceOf(TravelPlanResponseDto);
        });
    });
});
