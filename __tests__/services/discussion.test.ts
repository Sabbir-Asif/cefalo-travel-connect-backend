import { DiscussionService } from '../../src/services/discussion';
import { IDiscussionRepository } from '../../src/repositories/discussion';
import { CreateDiscussion, Discussion, DiscussionWithSender } from '../../src/interfaces/discussion';
import { DiscussionResponseDto, DiscussionWithSenderResponseDto } from '../../src/dtos/discussion';
import { Role, UserResponse } from '../../src/interfaces/user';
import { NotFoundException } from '../../src/exceptions/not-found';
import { ForbiddenException } from '../../src/exceptions/forbidden';
import { userService } from '../../src/controllers/user';
import { UUID } from 'crypto';

jest.mock('../../src/controllers/user');

const mockDiscussionRepo: jest.Mocked<IDiscussionRepository> = {
  create: jest.fn(),
  getByTravelPlanId: jest.fn(),
  getById: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
};

describe('DiscussionService - 100% Coverage', () => {
  const service = new DiscussionService(mockDiscussionRepo);

  const user: UserResponse = {
    id: 'user-1' as UUID,
    name: 'John',
    email: 'john@example.com',
    role: Role.TRAVELER,
    displayPicture: null,
    bio: null,
    phone_number: '123456',
    is_verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const admin: UserResponse = { ...user, id: 'admin-1' as UUID, role: Role.ADMIN };

  const discussion: Discussion = {
    id: 'd-1' as UUID,
    travel_plan_id: 'tp-1' as UUID,
    sender_id: 'user-1' as UUID,
    content: 'Hello world',
    created_at: new Date(),
  };

  const discussionWithSender: DiscussionWithSender = {
    ...discussion,
    sender: user,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a discussion if user exists', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      mockDiscussionRepo.create.mockResolvedValue(discussion);

      const payload: CreateDiscussion = { travel_plan_id: 'tp-1' as UUID, content: 'hi' };

      const result = await service.create('user-1' as UUID, payload);

      expect(result).toBeInstanceOf(DiscussionResponseDto);
      expect(mockDiscussionRepo.create).toHaveBeenCalledWith('user-1', payload);
    });

    it('should throw NotFoundException if user not found', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(new NotFoundException('not found', 1001));

      await expect(service.create('bad-id' as UUID, { travel_plan_id: 'tp-1' as UUID, content: 'bad' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getByTravelPlanId()', () => {
    it('should return mapped discussions', async () => {
      mockDiscussionRepo.getByTravelPlanId.mockResolvedValue([discussionWithSender]);

      const result = await service.getByTravelPlanId('tp-1' as UUID);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(DiscussionWithSenderResponseDto);
    });
  });

  describe('getById()', () => {
    it('should return a discussion if found', async () => {
      mockDiscussionRepo.getById.mockResolvedValue(discussionWithSender);

      const result = await service.getById('d-1' as UUID);

      expect(result).toBeInstanceOf(DiscussionWithSenderResponseDto);
    });

    it('should throw NotFoundException if not found', async () => {
      mockDiscussionRepo.getById.mockResolvedValue(null);

      await expect(service.getById('not-found' as UUID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete()', () => {
    it('should allow sender to delete their discussion', async () => {
      mockDiscussionRepo.getById.mockResolvedValue(discussionWithSender);
      (userService.getUserById as jest.Mock).mockResolvedValue(user);

      await service.delete('d-1' as UUID, 'user-1' as UUID);

      expect(mockDiscussionRepo.delete).toHaveBeenCalledWith('d-1');
    });

    it('should allow admin to delete any discussion', async () => {
      mockDiscussionRepo.getById.mockResolvedValue(discussionWithSender);
      (userService.getUserById as jest.Mock).mockResolvedValue(admin);

      await service.delete('d-1' as UUID, 'admin-1' as UUID);

      expect(mockDiscussionRepo.delete).toHaveBeenCalledWith('d-1');
    });

    it('should throw ForbiddenException if user is not sender or admin', async () => {
      const otherUser = { ...user, id: 'other-1' as UUID };
      mockDiscussionRepo.getById.mockResolvedValue(discussionWithSender);
      (userService.getUserById as jest.Mock).mockResolvedValue(otherUser);

      await expect(service.delete('d-1' as UUID, 'other-1' as UUID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if discussion does not exist', async () => {
      mockDiscussionRepo.getById.mockResolvedValue(null);

      await expect(service.delete('bad-id' as UUID, 'user-1' as UUID)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDiscussionRepo.getById.mockResolvedValue(discussionWithSender);
      (userService.getUserById as jest.Mock).mockRejectedValue(new NotFoundException('not found', 1001));

      await expect(service.delete('d-1' as UUID, 'bad-user' as UUID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search()', () => {
    it('should return matched discussions', async () => {
      mockDiscussionRepo.search.mockResolvedValue([discussionWithSender]);

      const result = await service.search({ travel_plan_id: 'tp-1' });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(DiscussionWithSenderResponseDto);
    });
  });
});
