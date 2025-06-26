import { UserRepository } from '../../../src/repositories/impl/user-impl';
import { CreateUser, UpdateUser, User } from '../../../src/interfaces/user';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => ({
  db: jest.fn()
}));

import { db } from '../../../src/configs/db';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockDb: jest.MockedFunction<any>;

  const mockUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' as UUID;
  const mockUser = {
    id: mockUserId,
    name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    password: 'hashedpassword',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  const mockCreateUser: CreateUser = {
    name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    password: 'hashedpassword'
  };

  const mockUpdateUser: UpdateUser = {
    name: 'Jane Doe',
    phone_number: '+0987654321',
  };

  beforeEach(() => {
    userRepository = new UserRepository();
    mockDb = db as jest.MockedFunction<any>;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully and return the user', async () => {
      const mockReturning = jest.fn().mockResolvedValue([mockUser]);
      const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.mockReturnValue({ insert: mockInsert });

      const result = await userRepository.create(mockCreateUser);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith({
        name: mockCreateUser.name,
        email: mockCreateUser.email,
        phone_number: mockCreateUser.phone_number,
        password: mockCreateUser.password
      });
      expect(mockReturning).toHaveBeenCalledWith('*');
      expect(result).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt)
      });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email and retrun the user', async () => {
      const mockFirst = jest.fn().mockResolvedValue(mockUser);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.findByEmail('john@example.com');

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt)
      });
    });

    it('should return null when user not found by email', async () => {
      const mockFirst = jest.fn().mockResolvedValue(null);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByPhoneNumber', () => {
    it('should find user by phone number and return the user', async () => {
      const mockFirst = jest.fn().mockResolvedValue(mockUser);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.findByPhoneNumber('+1234567890');

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ phone_number: '+1234567890' });
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt)
      });
    });

    it('should return null when user not found by phone number', async () => {
      const mockFirst = jest.fn().mockResolvedValue(null);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.findByPhoneNumber('+9999999999');

      expect(result).toBeNull();
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'another-id', email: 'another@example.com' }];
      const mockSelect = jest.fn().mockResolvedValue(mockUsers);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.findAllUsers();

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt)
      });
    });

    it('should return empty array when no users exist', async () => {
      const mockSelect = jest.fn().mockResolvedValue([]);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.findAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find user by id and return the user', async () => {
      const mockFirst = jest.fn().mockResolvedValue(mockUser);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.findById(mockUserId);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ id: mockUserId });
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt)
      });
    });

    it('should return null when user not found by id', async () => {
      const mockFirst = jest.fn().mockResolvedValue(null);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.findById('non-existent-id' as UUID);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user and return the updated user', async () => {
      const updatedUser = { ...mockUser, ...mockUpdateUser };
      const mockReturning = jest.fn().mockResolvedValue([updatedUser]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.update(mockUserId, mockUpdateUser);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ id: mockUserId });
      expect(mockUpdate).toHaveBeenCalledWith({
        ...mockUpdateUser,
        updatedAt: expect.any(Date)
      });
      expect(mockReturning).toHaveBeenCalledWith('*');
      expect(result).toEqual({
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt)
      });
    });

    it('should return null when user to update is not found', async () => {
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockUpdate = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.update('non-existent-id' as UUID, mockUpdateUser);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const mockDel = jest.fn().mockResolvedValue(1);
      const mockWhere = jest.fn().mockReturnValue({ del: mockDel });
      mockDb.mockReturnValue({ where: mockWhere });

      await userRepository.delete(mockUserId);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ id: mockUserId });
      expect(mockDel).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search users by name', async () => {
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        whereILike: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockUsers))
      };
      const mockSelect = jest.fn().mockReturnValue(mockQueryBuilder);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.search({ name: 'John' });

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.whereILike).toHaveBeenCalledWith('name', '%John%');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt)
      });
    });

    it('should search users by email', async () => {
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        whereILike: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockUsers))
      };
      const mockSelect = jest.fn().mockReturnValue(mockQueryBuilder);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.search({ email: 'john@' });

      expect(mockQueryBuilder.whereILike).toHaveBeenCalledWith('email', '%john@%');
      expect(result).toHaveLength(1);
    });

    it('should search users by phone number', async () => {
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        whereILike: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockUsers))
      };
      const mockSelect = jest.fn().mockReturnValue(mockQueryBuilder);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.search({ phone_number: '123' });

      expect(mockQueryBuilder.whereILike).toHaveBeenCalledWith('phone_number', '%123%');
      expect(result).toHaveLength(1);
    });

    it('should search users by multiple parameters', async () => {
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        whereILike: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockUsers))
      };
      const mockSelect = jest.fn().mockReturnValue(mockQueryBuilder);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.search({
        name: 'John',
        email: 'john@',
        phone_number: '123'
      });

      expect(mockQueryBuilder.whereILike).toHaveBeenCalledWith('name', '%John%');
      expect(mockQueryBuilder.whereILike).toHaveBeenCalledWith('email', '%john@%');
      expect(mockQueryBuilder.whereILike).toHaveBeenCalledWith('phone_number', '%123%');
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no users match search criteria', async () => {
      const mockQueryBuilder = {
        whereILike: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([]))
      };
      const mockSelect = jest.fn().mockReturnValue(mockQueryBuilder);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.search({ name: 'NonExistent' });

      expect(result).toEqual([]);
    });

    it('should return all users when no search parameters provided', async () => {
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        whereILike: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockUsers))
      };
      const mockSelect = jest.fn().mockReturnValue(mockQueryBuilder);
      mockDb.mockReturnValue({ select: mockSelect });

      const result = await userRepository.search({});

      expect(mockQueryBuilder.whereILike).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('toModel', () => {
    it('should convert database row to User model', async () => {
      const mockFirst = jest.fn().mockResolvedValue(mockUser);
      const mockWhere = jest.fn().mockReturnValue({ first: mockFirst });
      mockDb.mockReturnValue({ where: mockWhere });

      const result = await userRepository.findById(mockUserId);

      expect(result).toEqual({
        ...mockUser,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt)
      });
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });
  });
});