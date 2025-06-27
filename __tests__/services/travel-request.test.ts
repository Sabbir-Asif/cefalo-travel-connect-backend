import { TravelRequestService } from '../../src/services/travel-request';
import { ITravelRequestRepository } from '../../src/repositories/travel-request';
import { CreateTravelRequest, UpdateTravelRequest, TravelRequest, TravelRequestWithUsers, TravelRequestStatus } from '../../src/interfaces/travel-request';
import { Role, UserResponse } from '../../src/interfaces/user';
import { TravelRequestResponseDto, TravelRequestWithUsersResponseDto } from '../../src/dtos/travel-request';
import { NotFoundException } from '../../src/exceptions/not-found';
import { ForbiddenException } from '../../src/exceptions/forbidden';
import { userService } from '../../src/controllers/user';
import { travelPlanService } from '../../src/controllers/travel-plan';
import { UUID } from 'crypto';

jest.mock('../../src/controllers/user');
jest.mock('../../src/controllers/travel-plan');

const mockRepo: jest.Mocked<ITravelRequestRepository> = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
};

const now = new Date();

const sender: UserResponse = {
  id: '00000000-0000-0000-0000-000000000010' as UUID,
  name: 'Sender',
  email: 's@example.com',
  role: Role.TRAVELER,
  displayPicture: null,
  bio: null,
  phone_number: '111',
  is_verified: true,
  createdAt: now,
  updatedAt: now,
};

const recipient: UserResponse = {
  ...sender,
  id: '00000000-0000-0000-0000-000000000011' as UUID,
  name: 'Recipient',
  email: 'r@example.com',
};

const travelPlan = {
  id: '00000000-0000-0000-0000-000000000100',
};

const createPayload: CreateTravelRequest = {
  travel_plan_id: travelPlan.id as UUID,
  user_to: recipient.id,
  title: 'Join my trip',
  message: 'Let’s travel together',
};

const baseRequest: TravelRequest = {
  id: '00000000-0000-0000-0000-000000000200' as UUID,
  travel_plan_id: travelPlan.id as UUID,
  user_from: sender.id,
  user_to: recipient.id,
  title: createPayload.title,
  message: createPayload.message,
  status: TravelRequestStatus.PENDING,
  created_at: now,
  updated_at: now,
};

const withUsers: TravelRequestWithUsers = {
  ...baseRequest,
  from_user: sender,
  to_user: recipient,
};

describe('TravelRequestService', () => {
  const service = new TravelRequestService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTravelRequest', () => {
    it('creates a request', async () => {
      (userService.getUserById as jest.Mock)
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(recipient);
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue(travelPlan);
      mockRepo.create.mockResolvedValue(baseRequest);

      const res = await service.createTravelRequest(sender.id, createPayload);

      expect(res).toBeInstanceOf(TravelRequestResponseDto);
      expect(mockRepo.create).toHaveBeenCalledWith(sender.id, createPayload);
    });

    it('throws when sender missing', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createTravelRequest('ghost' as UUID, createPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when recipient missing', async () => {
      (userService.getUserById as jest.Mock)
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(null);

      await expect(
        service.createTravelRequest(sender.id, createPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when travel plan missing', async () => {
      (userService.getUserById as jest.Mock)
        .mockResolvedValue(sender);
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createTravelRequest(sender.id, createPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllTravelRequests', () => {
    it('maps to DTOs', async () => {
      mockRepo.getAll.mockResolvedValue([withUsers]);

      const res = await service.getAllTravelRequests();

      expect(res[0]).toBeInstanceOf(TravelRequestWithUsersResponseDto);
    });
  });

  describe('getTravelRequestById', () => {
    it('returns DTO', async () => {
      mockRepo.getById.mockResolvedValue(withUsers);

      const res = await service.getTravelRequestById(baseRequest.id);

      expect(res).toBeInstanceOf(TravelRequestWithUsersResponseDto);
    });

    it('throws when missing', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(
        service.getTravelRequestById('missing' as UUID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTravelRequest', () => {
    const upd: UpdateTravelRequest = { status: TravelRequestStatus.ACCEPTED };

    it('recipient updates', async () => {
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(recipient);
      mockRepo.update.mockResolvedValue({ ...baseRequest, ...upd });

      const res = await service.updateTravelRequest(baseRequest.id, recipient.id, upd);

      expect(res).toBeInstanceOf(TravelRequestResponseDto);
      expect(mockRepo.update).toHaveBeenCalledWith(baseRequest.id, upd);
    });

    it('admin updates', async () => {
      const admin: UserResponse = { ...sender, role: Role.ADMIN, id: '00000000-0000-0000-0000-000000000099' as UUID };
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(admin);
      mockRepo.update.mockResolvedValue({ ...baseRequest, ...upd });

      await service.updateTravelRequest(baseRequest.id, admin.id, upd);

      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('forbidden for others', async () => {
      const stranger: UserResponse = { ...sender, id: '00000000-0000-0000-0000-000000000012' as UUID };
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

      await expect(
        service.updateTravelRequest(baseRequest.id, stranger.id, upd),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws when request missing', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(
        service.updateTravelRequest('bad' as UUID, sender.id, upd),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when user missing', async () => {
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateTravelRequest(baseRequest.id, 'ghost' as UUID, upd),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTravelRequest', () => {
    it('sender deletes', async () => {
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(sender);

      await service.deleteTravelRequest(baseRequest.id, sender.id);

      expect(mockRepo.delete).toHaveBeenCalledWith(baseRequest.id);
    });

    it('admin deletes', async () => {
      const admin: UserResponse = { ...sender, role: Role.ADMIN, id: '00000000-0000-0000-0000-000000000098' as UUID };
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(admin);

      await service.deleteTravelRequest(baseRequest.id, admin.id);

      expect(mockRepo.delete).toHaveBeenCalledWith(baseRequest.id);
    });

    it('forbidden for others', async () => {
      const stranger = { ...sender, id: '00000000-0000-0000-0000-000000000013' as UUID };
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

      await expect(
        service.deleteTravelRequest(baseRequest.id, stranger.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws when request missing', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(
        service.deleteTravelRequest('missing' as UUID, sender.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when user missing', async () => {
      mockRepo.getById.mockResolvedValue(withUsers);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteTravelRequest(baseRequest.id, 'ghost' as UUID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchTravelRequests', () => {
    it('maps results', async () => {
      mockRepo.search.mockResolvedValue([withUsers]);

      const res = await service.searchTravelRequests({ q: 'join' });

      expect(res[0]).toBeInstanceOf(TravelRequestWithUsersResponseDto);
    });
  });
});
