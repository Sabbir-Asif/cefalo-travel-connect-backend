import { WishlistService } from '../../src/services/wishlist';
import { IWishlistRepository } from '../../src/repositories/wishlist';
import { CreateWishlist, UpdateWishlist, Wishlist, WishlistStatus, WishlistWithUser } from '../../src/interfaces/wishlist';
import { Role, UserResponse } from '../../src/interfaces/user';
import { WishlistResponseDto, WishlistWithUserResponseDto } from '../../src/dtos/wishlist';
import { NotFoundException } from '../../src/exceptions/not-found';
import { ForbiddenException } from '../../src/exceptions/forbidden';
import { userService } from '../../src/controllers/user';
import { blogService } from '../../src/controllers/blog';
import { UUID } from 'crypto';

jest.mock('../../src/controllers/user');
jest.mock('../../src/controllers/blog');
jest.mock('../../src/configs/db', () => {
  const dbMock = jest.fn();
  return { db: dbMock };
});

const mockWishlistRepository: jest.Mocked<IWishlistRepository> = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  getByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
};

const now = new Date();

const user: UserResponse = {
  id: '00000000-0000-0000-0000-000000000010' as UUID,
  name: 'John',
  email: 'john@example.com',
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

const location = { lat: 23.7, long: 90.4 };

const wishlistBase: Wishlist = {
  id: '00000000-0000-0000-0000-000000000100' as UUID,
  user_id: user.id,
  title: 'Cox trip',
  location_name: 'Cox',
  location_point: location,
  travel_date: new Date('2030-01-01'),
  tags: ['beach'],
  note: 'note',
  blog_id: null,
  travel_place_id: null,
  cover_image: undefined,
  status: WishlistStatus.PRIVATE,
  created_at: now,
  updated_at: now,
};

const wishlistWithUser: WishlistWithUser = { ...wishlistBase, user };

describe('WishlistService', () => {
  const service = new WishlistService(mockWishlistRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWishlist', () => {
    const payload: CreateWishlist = {
      title: 'Srimangal',
      location_name: 'Srimangal',
      location_point: location,
      travel_date: new Date('2030-02-02'),
    };

    it('creates wishlist', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      mockWishlistRepository.create.mockResolvedValue(
        { ...wishlistBase, ...payload } as Wishlist,
      );

      const res = await service.createWishlist(user.id, payload);

      expect(res).toBeInstanceOf(WishlistResponseDto);
      expect(mockWishlistRepository.create).toHaveBeenCalledWith(user.id, payload);
    });

    it('throws when user missing', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createWishlist('bad-id' as UUID, payload),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when blog missing', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createWishlist(user.id, { ...payload, blog_id: 'blog-x' as UUID }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllWishlists', () => {
    it('returns DTO list', async () => {
      mockWishlistRepository.getAll.mockResolvedValue([wishlistWithUser]);

      const res = await service.getAllWishlists();

      expect(res[0]).toBeInstanceOf(WishlistWithUserResponseDto);
    });
  });

  describe('getWishlistById', () => {
    it('returns DTO when found', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);

      const res = await service.getWishlistById(wishlistBase.id);

      expect(res).toBeInstanceOf(WishlistWithUserResponseDto);
    });

    it('throws when not found', async () => {
      mockWishlistRepository.getById.mockResolvedValue(null);

      await expect(
        service.getWishlistById('missing' as UUID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateWishlist', () => {
    const updateData: UpdateWishlist = { title: 'Updated' };

    it('owner can update', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      mockWishlistRepository.update.mockResolvedValue(
        { ...wishlistBase, ...updateData } as Wishlist,
      );

      const res = await service.updateWishlist(wishlistBase.id, user.id, updateData);

      expect(res).toBeInstanceOf(WishlistResponseDto);
      expect(mockWishlistRepository.update).toHaveBeenCalledWith(wishlistBase.id, updateData);
    });

    it('admin can update', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(admin);
      mockWishlistRepository.update.mockResolvedValue(
        { ...wishlistBase, ...updateData } as Wishlist,
      );

      await service.updateWishlist(wishlistBase.id, admin.id, updateData);

      expect(mockWishlistRepository.update).toHaveBeenCalled();
    });

    it('forbidden for others', async () => {
      const stranger = { ...user, id: '00000000-0000-0000-0000-000000000012' as UUID };
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

      await expect(
        service.updateWishlist(wishlistBase.id, stranger.id, updateData),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws when wishlist missing', async () => {
      mockWishlistRepository.getById.mockResolvedValue(null);

      await expect(
        service.updateWishlist('bad-id' as UUID, user.id, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when user missing', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateWishlist(wishlistBase.id, 'ghost' as UUID, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when blog missing', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      (blogService.getBlogById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateWishlist(
          wishlistBase.id,
          user.id,
          { ...updateData, blog_id: 'bad-blog' as UUID },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteWishlist', () => {
    it('owner deletes', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(user);

      await service.deleteWishlist(wishlistBase.id, user.id);

      expect(mockWishlistRepository.delete).toHaveBeenCalledWith(wishlistBase.id);
    });

    it('admin deletes', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(admin);

      await service.deleteWishlist(wishlistBase.id, admin.id);

      expect(mockWishlistRepository.delete).toHaveBeenCalledWith(wishlistBase.id);
    });

    it('forbidden for others', async () => {
      const stranger = { ...user, id: '00000000-0000-0000-0000-000000000013' as UUID };
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(stranger);

      await expect(
        service.deleteWishlist(wishlistBase.id, stranger.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws when wishlist missing', async () => {
      mockWishlistRepository.getById.mockResolvedValue(null);

      await expect(
        service.deleteWishlist('missing-id' as UUID, user.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when user missing', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteWishlist(wishlistBase.id, 'ghost' as UUID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchWishlists', () => {
    it('maps to DTOs', async () => {
      mockWishlistRepository.search.mockResolvedValue([wishlistWithUser]);

      const res = await service.searchWishlists({ q: 'cox' });

      expect(res[0]).toBeInstanceOf(WishlistWithUserResponseDto);
    });
  });

  describe('getWishlistsByUserId', () => {
    it('returns list', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      mockWishlistRepository.getByUserId.mockResolvedValue([wishlistBase]);

      const res = await service.getWishlistsByUserId(user.id);

      expect(res[0]).toBeInstanceOf(WishlistResponseDto);
    });

    it('throws when user missing', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getWishlistsByUserId('ghost' as UUID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMatchingUsers', () => {
    const dbMock = (require('../../src/configs/db').db as jest.Mock);
    const matchId = '00000000-0000-0000-0000-000000000099' as UUID;
    const dbRows = [{ id: matchId }];

    it('returns [] when no upcoming wishlist', async () => {
      mockWishlistRepository.getByUserId.mockResolvedValue([
        { ...wishlistBase, travel_date: new Date('2000-01-01') },
      ]);

      const res = await service.findMatchingUsers(user.id, { radius: 5, timeDiff: '5' });

      expect(res).toEqual([]);
    });

    it('returns matches with wishlistId', async () => {
      mockWishlistRepository.getById.mockResolvedValue(wishlistWithUser);
      mockWishlistRepository.getByUserId.mockResolvedValue([]);
      (userService.getUserById as jest.Mock).mockImplementation((id: UUID) =>
        id === matchId ? { ...user, id: matchId } : user,
      );

      dbMock.mockImplementation(() => {
        const chain: any = {};
        ['select', 'join', 'whereNot', 'andWhereBetween', 'andWhereRaw', 'groupBy', 'limit'].forEach(
          m => (chain[m] = () => chain),
        );
        chain.offset = () => Promise.resolve(dbRows);
        return chain;
      });

      const res = await service.findMatchingUsers(user.id, {
        radius: 10,
        timeDiff: '10',
        wishlistId: wishlistBase.id,
      });

      expect(res.length).toBe(1);
      expect(res[0].id).toBe(matchId);
    });

    it('throws when wishlistId invalid', async () => {
      mockWishlistRepository.getById.mockResolvedValue(null);

      await expect(
        service.findMatchingUsers(user.id, { radius: 1, timeDiff: '1', wishlistId: 'bad' as UUID }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
