import { TransportService } from '../../src/services/transport';
import { ITransportRepository } from '../../src/repositories/transport';
import { CreateTransport, Transport, TransportLocation, TransportType, UpdateTransport } from '../../src/interfaces/transport';
import { TransportResponseDto } from '../../src/dtos/transport';
import { NotFoundException } from '../../src/exceptions/not-found';
import { UUID } from 'crypto';

const mockRepo: jest.Mocked<ITransportRepository> = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  allStratingLocations: jest.fn(),
  allDestinationLocations: jest.fn(),
};

const now = new Date();

const createPayload: CreateTransport = {
  type: TransportType.BUS,
  name: 'Green Line',
  starting_location: 'Dhaka',
  starting_point: { lat: 23.8, long: 90.4 },
  destination: 'Cox’s Bazar',
  destination_point: { lat: 21.4, long: 91.9 },
  departure_time: '08:00',
  arrival_time: '20:00',
  fare: '1500',
};

const baseTransport: Transport = {
  id: '00000000-0000-0000-0000-000000000150' as UUID,
  type: TransportType.BUS,
  name: 'Green Line',
  starting_location: 'Dhaka',
  starting_point: { lat: 23.8, long: 90.4 },
  destination: 'Cox’s Bazar',
  destination_point: { lat: 21.4, long: 91.9 },
  departure_time: null,
  arrival_time: null,
  fare: '1500',
  created_at: now,
  updated_at: now,
};

describe('TransportService', () => {
  const service = new TransportService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransport', () => {
    it('creates and maps to DTO', async () => {
      mockRepo.create.mockResolvedValue(baseTransport);

      const res = await service.createTransport(createPayload);

      expect(res).toBeInstanceOf(TransportResponseDto);
      expect(mockRepo.create).toHaveBeenCalledWith(createPayload);
    });
  });

  describe('getAllTransports', () => {
    it('returns DTO list', async () => {
      mockRepo.getAll.mockResolvedValue([baseTransport]);

      const res = await service.getAllTransports();

      expect(res[0]).toBeInstanceOf(TransportResponseDto);
    });
  });

  describe('getTransportById', () => {
    it('returns DTO when found', async () => {
      mockRepo.getById.mockResolvedValue(baseTransport);

      const res = await service.getTransportById(baseTransport.id);

      expect(res).toBeInstanceOf(TransportResponseDto);
    });

    it('throws NotFound when missing', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(
        service.getTransportById('missing' as UUID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTransport', () => {
    const upd: UpdateTransport = { name: 'Updated' };

    it('updates and maps to DTO', async () => {
      mockRepo.getById.mockResolvedValue(baseTransport);
      mockRepo.update.mockResolvedValue({ ...baseTransport, ...upd } as Transport);

      const res = await service.updateTransport(baseTransport.id, upd);

      expect(res).toBeInstanceOf(TransportResponseDto);
      expect(mockRepo.update).toHaveBeenCalledWith(baseTransport.id, upd);
    });

    it('throws NotFound when transport missing', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(
        service.updateTransport('bad' as UUID, upd),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTransport', () => {
    it('deletes when exists', async () => {
      mockRepo.getById.mockResolvedValue(baseTransport);
      mockRepo.delete.mockResolvedValue(1);

      const res = await service.deleteTransport(baseTransport.id);

      expect(res).toBe(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(baseTransport.id);
    });

    it('throws NotFound when missing', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(
        service.deleteTransport('missing' as UUID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllStartingLocations', () => {
    it('returns locations', async () => {
      const locs: TransportLocation[] = [
        { name: 'Dhaka', location_point: { lat: 23.8, long: 90.4 } },
      ];
      mockRepo.allStratingLocations.mockResolvedValue(locs);

      const res = await service.getAllStartingLocations();

      expect(res).toEqual(locs);
    });
  });

  describe('getAllDestinationLocations', () => {
    it('returns locations', async () => {
      const locs: TransportLocation[] = [
        { name: 'Cox’s Bazar', location_point: { lat: 21.4, long: 91.9 } },
      ];
      mockRepo.allDestinationLocations.mockResolvedValue(locs);

      const res = await service.getAllDestinationLocations();

      expect(res).toEqual(locs);
    });
  });

  describe('searchTransports', () => {
    it('maps search results', async () => {
      mockRepo.search.mockResolvedValue([baseTransport]);

      const res = await service.searchTransports({ destination: 'Cox' });

      expect(res[0]).toBeInstanceOf(TransportResponseDto);
      expect(mockRepo.search).toHaveBeenCalledWith({ destination: 'Cox' });
    });
  });
});
