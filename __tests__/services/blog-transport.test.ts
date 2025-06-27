import { BlogTransportService } from '../../src/services/blog-transport';
import { IBlogTransportRepository } from '../../src/repositories/blog-transport';
import { UUID } from 'crypto';
import { BlogTransport } from '../../src/interfaces/blog-transport';
import { Transport, TransportType } from '../../src/interfaces/transport';

const mockRepo: jest.Mocked<IBlogTransportRepository> = {
  create: jest.fn(),
  delete: jest.fn(),
  transportForBlog: jest.fn(),
};

const blogId = '00000000-0000-0000-0000-000000000001' as UUID;
const transportId = '00000000-0000-0000-0000-000000000002' as UUID;
const now = new Date();

const blogTransport: BlogTransport = {
  blog_id: blogId,
  transport_id: transportId,
};

const transport: Transport = {
  id: transportId,
  type: TransportType.BUS,
  name: 'GreenLine',
  starting_location: 'Dhaka',
  starting_point: { lat: 23.8, long: 90.4 },
  destination: 'Cox’s Bazar',
  destination_point: { lat: 21.4, long: 91.8 },
  departure_time: new Date('2030-01-01T08:00:00Z'),
  arrival_time: new Date('2030-01-01T20:00:00Z'),
  fare: '1200',
  created_at: now,
  updated_at: now,
};

describe('BlogTransportService', () => {
  const service = new BlogTransportService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBlogTransport', () => {
    it('creates blog-transport entry', async () => {
      mockRepo.create.mockResolvedValue(blogTransport);

      const result = await service.createBlogTransport(blogId, transportId);

      expect(result.blog_id).toBe(blogId);
      expect(result.transport_id).toBe(transportId);
      expect(mockRepo.create).toHaveBeenCalledWith(blogId, transportId);
    });
  });

  describe('deleteBlogTransport', () => {
    it('deletes blog-transport entry', async () => {
      mockRepo.delete.mockResolvedValue(1);

      const result = await service.deleteBlogTransport(blogId, transportId);

      expect(result).toBe(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(blogId, transportId);
    });
  });

  describe('getTransportsForBlog', () => {
    it('returns list of TransportResponseDto', async () => {
      mockRepo.transportForBlog.mockResolvedValue([transport]);

      const result = await service.getTransportsForBlog(blogId);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(transportId);
      expect(result[0].name).toBe(transport.name);
      expect(result[0].type).toBe(TransportType.BUS);
      expect(mockRepo.transportForBlog).toHaveBeenCalledWith(blogId);
    });
  });
});
