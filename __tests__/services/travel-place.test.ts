import { TravelPlaceService } from '../../src/services/travel-place';
import { ITravelPlaceRepository } from '../../src/repositories/travel-place';
import { Role, User } from '../../src/interfaces/user';
import { TravelPlace } from '../../src/interfaces/travel-place';
import { NotFoundException } from '../../src/exceptions/not-found';
import { ForbiddenException } from '../../src/exceptions/forbidden';
import { userService } from '../../src/controllers/user';
import { UUID } from 'crypto';
import { ErrorCode } from '../../src/exceptions/root';

jest.mock('../../src/controllers/user');

const mockTravelPlaceRepository = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn()
} as unknown as jest.Mocked<ITravelPlaceRepository>;

const service = new TravelPlaceService(mockTravelPlaceRepository);

const userId = 'user-123' as UUID;
const adminId = 'admin-123' as UUID;
const travelPlaceId = 'tp-456' as UUID;

const mockUser: User = {
  id: userId,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedpw',
  phone_number: '1234567890',
  displayPicture: null,
  bio: null,
  is_verified: true,
  role: Role.TRAVELER,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockAdminUser: User = { ...mockUser, id: adminId, role: Role.ADMIN };

const mockTravelPlace: TravelPlace = {
  id: travelPlaceId,
  user_id: userId,
  name: 'Hill Park',
  location_name: 'Bandarban',
  location_point: { lat: 23.5, long: 91.2 },
  cover_image: 'image.jpg',
  description: 'A beautiful hill park',
  tags: ['nature', 'hill'],
  created_at: new Date(),
  updated_at: new Date()
};

describe('TravelPlaceService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTravelPlace', () => {
    it('should create a travel place if user exists', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      mockTravelPlaceRepository.create.mockResolvedValue(mockTravelPlace);

      const result = await service.createTravelPlace(userId, {
        name: mockTravelPlace.name,
        location_name: mockTravelPlace.location_name,
        location_point: mockTravelPlace.location_point,
        cover_image: mockTravelPlace.cover_image,
        description: mockTravelPlace.description,
        tags: mockTravelPlace.tags
      });

      expect(result).toMatchObject({ id: travelPlaceId, name: mockTravelPlace.name });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(new NotFoundException('User not found', ErrorCode.USER_NOTFOUND));

      await expect(
        service.createTravelPlace(userId, {
          name: mockTravelPlace.name,
          location_name: mockTravelPlace.location_name,
          location_point: mockTravelPlace.location_point
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllTravelPlaces', () => {
    it('should return all travel places', async () => {
      mockTravelPlaceRepository.getAll.mockResolvedValue([mockTravelPlace]);
      const result = await service.getAllTravelPlaces();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(travelPlaceId);
    });
  });

  describe('getTravelPlaceById', () => {
    it('should return travel place if found', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(mockTravelPlace);
      const result = await service.getTravelPlaceById(travelPlaceId);
      expect(result.id).toBe(travelPlaceId);
    });

    it('should throw NotFoundException if not found', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(null);
      await expect(service.getTravelPlaceById(travelPlaceId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTravelPlace', () => {
    it('should update if user is owner', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(mockTravelPlace);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      mockTravelPlaceRepository.update.mockResolvedValue({ ...mockTravelPlace, name: 'Updated Name' });

      const result = await service.updateTravelPlace(travelPlaceId, userId, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });

    it('should update if user is admin', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(mockTravelPlace);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockAdminUser);
      mockTravelPlaceRepository.update.mockResolvedValue({ ...mockTravelPlace, name: 'Updated Name' });

      const result = await service.updateTravelPlace(travelPlaceId, adminId, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw ForbiddenException if not owner or admin', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(mockTravelPlace);
      (userService.getUserById as jest.Mock).mockResolvedValue({ ...mockUser, id: 'other-user' });

      await expect(service.updateTravelPlace(travelPlaceId, 'other-user' as UUID, { name: 'x' }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTravelPlace', () => {
    it('should delete if owner', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(mockTravelPlace);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      mockTravelPlaceRepository.delete.mockResolvedValue();

      await expect(service.deleteTravelPlace(travelPlaceId, userId)).resolves.toBeUndefined();
    });

    it('should delete if admin', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(mockTravelPlace);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockAdminUser);
      mockTravelPlaceRepository.delete.mockResolvedValue();

      await expect(service.deleteTravelPlace(travelPlaceId, adminId)).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException if not owner or admin', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(mockTravelPlace);
      (userService.getUserById as jest.Mock).mockResolvedValue({ ...mockUser, id: 'stranger' });

      await expect(service.deleteTravelPlace(travelPlaceId, 'stranger' as UUID))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if travel place not found', async () => {
      mockTravelPlaceRepository.getById.mockResolvedValue(null);

      await expect(service.deleteTravelPlace(travelPlaceId, userId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('searchTravelPlaces', () => {
    it('should return search results', async () => {
      mockTravelPlaceRepository.search.mockResolvedValue([mockTravelPlace]);
      const result = await service.searchTravelPlaces({ name: 'Hill' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(mockTravelPlace.name);
    });
  });
});
