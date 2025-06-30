import { BlogTransportRepository } from '../../../src/infrastructure/blogTransport-impl';
import { BlogTransport } from '../../../src/interfaces/blog-transport';
import { Transport, TransportType } from '../../../src/interfaces/transport';
import { UUID } from 'crypto';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn().mockImplementation((...args) => ({ __raw: true, sql: args[0], bindings: args[1] }));
    return {
        db: mDb
    };
});
import { db } from '../../../src/configs/db';

describe('BlogTransportRepository', () => {
    let blogTransportRepository: BlogTransportRepository;
    let mockDb: jest.MockedFunction<any>;

    const blogId = 'blog-id-123' as UUID;
    const transportId = 'transport-id-456' as UUID;
    
    const mockBlogTransportRow = {
        blog_id: blogId,
        transport_id: transportId
    };

    const expectedBlogTransport: BlogTransport = {
        blog_id: blogId,
        transport_id: transportId
    };

    const mockTransportRow = {
        id: transportId,
        type: TransportType.FLIGHT,
        name: 'Emirates Flight EK123',
        starting_location: 'Dubai International Airport',
        destination: 'London Heathrow Airport',
        departure_time: '2023-01-01T10:00:00.000Z',
        arrival_time: '2023-01-01T14:00:00.000Z',
        fare: '899.99',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        start_lat: '25.2532',
        start_long: '55.3657',
        des_lat: '51.4700',
        des_long: '-0.4543'
    };

    const expectedTransport: Transport = {
        id: transportId,
        type: TransportType.FLIGHT,
        name: 'Emirates Flight EK123',
        starting_location: 'Dubai International Airport',
        starting_point: {
            lat: 25.2532,
            long: 55.3657
        },
        destination: 'London Heathrow Airport',
        destination_point: {
            lat: 51.4700,
            long: -0.4543
        },
        departure_time: new Date('2023-01-01T10:00:00.000Z'),
        arrival_time: new Date('2023-01-01T14:00:00.000Z'),
        fare: '899.99',
        created_at: new Date(mockTransportRow.created_at),
        updated_at: new Date(mockTransportRow.updated_at)
    };

    beforeEach(() => {
        blogTransportRepository = new BlogTransportRepository();
        mockDb = db as jest.MockedFunction<any>;
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return the created blog-transport relationship', async () => {
            const mockReturning = jest.fn().mockResolvedValue([mockBlogTransportRow]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            mockDb.mockReturnValue({ insert: mockInsert });

            const result = await blogTransportRepository.create(blogId, transportId);

            expect(mockDb).toHaveBeenCalledWith('blog_transports');
            expect(mockInsert).toHaveBeenCalledWith({ 
                blog_id: blogId, 
                transport_id: transportId 
            });
            expect(mockReturning).toHaveBeenCalledWith(['*']);
            expect(result).toEqual(expectedBlogTransport);
        });
    });

    describe('delete', () => {
        it('should delete the blog-transport relationship and return count', async () => {
            const mockDelete = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ delete: mockDelete });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogTransportRepository.delete(blogId, transportId);

            expect(mockDb).toHaveBeenCalledWith('blog_transports');
            expect(mockWhere).toHaveBeenCalledWith({ 
                blog_id: blogId, 
                transport_id: transportId 
            });
            expect(mockDelete).toHaveBeenCalled();
            expect(result).toBe(1);
        });

        it('should return 0 if no relationship exists', async () => {
            const mockDelete = jest.fn().mockResolvedValue(0);
            const mockWhere = jest.fn().mockReturnValue({ delete: mockDelete });
            mockDb.mockReturnValue({ where: mockWhere });

            const result = await blogTransportRepository.delete(blogId, 'non-existent-transport-id' as UUID);

            expect(result).toBe(0);
        });
    });

    describe('transportForBlog', () => {
        it('should return all transports for a blog with parsed coordinates and dates', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockTransportRow]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogTransportRepository.transportForBlog(blogId);

            expect(mockDb).toHaveBeenCalledWith('blog_transports');
            expect(mockJoin).toHaveBeenCalledWith('transports', 'blog_transports.transport_id', 'transports.id');
            expect(mockWhere).toHaveBeenCalledWith('blog_transports.blog_id', blogId);
            expect(mockSelect).toHaveBeenCalledWith(
                'transports.*',
                expect.objectContaining({ __raw: true }),
                expect.objectContaining({ __raw: true }),
                expect.objectContaining({ __raw: true }),
                expect.objectContaining({ __raw: true })
            );
            expect(result).toEqual([expectedTransport]);
        });

        it('should return empty array if no transports found for blog', async () => {
            const mockSelect = jest.fn().mockResolvedValue([]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogTransportRepository.transportForBlog('non-existent-blog-id' as UUID);

            expect(result).toEqual([]);
        });

        it('should handle multiple transports for a blog', async () => {
            const mockTransportRow2 = {
                ...mockTransportRow,
                id: 'transport-id-789' as UUID,
                type: TransportType.TRAIN,
                name: 'Eurostar Train',
                starting_location: 'London St Pancras',
                destination: 'Paris Gare du Nord',
                departure_time: '2023-01-02T08:00:00.000Z',
                arrival_time: '2023-01-02T11:30:00.000Z',
                fare: '150.00',
                start_lat: '51.5308',
                start_long: '-0.1238',
                des_lat: '48.8809',
                des_long: '2.3553'
            };

            const expectedTransport2: Transport = {
                ...expectedTransport,
                id: 'transport-id-789' as UUID,
                type: TransportType.TRAIN,
                name: 'Eurostar Train',
                starting_location: 'London St Pancras',
                starting_point: {
                    lat: 51.5308,
                    long: -0.1238
                },
                destination: 'Paris Gare du Nord',
                destination_point: {
                    lat: 48.8809,
                    long: 2.3553
                },
                departure_time: new Date('2023-01-02T08:00:00.000Z'),
                arrival_time: new Date('2023-01-02T11:30:00.000Z'),
                fare: '150.00'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockTransportRow, mockTransportRow2]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogTransportRepository.transportForBlog(blogId);

            expect(result).toEqual([expectedTransport, expectedTransport2]);
        });

        it('should properly parse location coordinates from strings to numbers', async () => {
            const mockTransportWithStringCoords = {
                ...mockTransportRow,
                start_lat: '40.7128',
                start_long: '-74.0060',
                des_lat: '34.0522',
                des_long: '-118.2437'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockTransportWithStringCoords]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogTransportRepository.transportForBlog(blogId);

            expect(result[0].starting_point.lat).toBe(40.7128);
            expect(result[0].starting_point.long).toBe(-74.0060);
            expect(result[0].destination_point.lat).toBe(34.0522);
            expect(result[0].destination_point.long).toBe(-118.2437);
            expect(typeof result[0].starting_point.lat).toBe('number');
            expect(typeof result[0].starting_point.long).toBe('number');
            expect(typeof result[0].destination_point.lat).toBe('number');
            expect(typeof result[0].destination_point.long).toBe('number');
        });

        it('should properly parse date fields', async () => {
            const mockTransportWithDifferentDates = {
                ...mockTransportRow,
                departure_time: '2023-06-15T09:00:00.000Z',
                arrival_time: '2023-06-15T15:30:00.000Z',
                created_at: '2023-06-01T10:00:00.000Z',
                updated_at: '2023-06-10T14:00:00.000Z'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockTransportWithDifferentDates]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogTransportRepository.transportForBlog(blogId);

            expect(result[0].departure_time).toEqual(new Date('2023-06-15T09:00:00.000Z'));
            expect(result[0].arrival_time).toEqual(new Date('2023-06-15T15:30:00.000Z'));
            expect(result[0].created_at).toEqual(new Date('2023-06-01T10:00:00.000Z'));
            expect(result[0].updated_at).toEqual(new Date('2023-06-10T14:00:00.000Z'));
        });

        it('should handle transports with null departure and arrival times', async () => {
            const mockTransportWithNullTimes = {
                ...mockTransportRow,
                departure_time: null,
                arrival_time: null
            };

            const expectedTransportWithNullTimes: Transport = {
                ...expectedTransport,
                departure_time: null,
                arrival_time: null
            };

            const mockSelect = jest.fn().mockResolvedValue([mockTransportWithNullTimes]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogTransportRepository.transportForBlog(blogId);

            expect(result).toEqual([expectedTransportWithNullTimes]);
        });

        it('should handle zero coordinates correctly', async () => {
            const mockTransportWithZeroCoords = {
                ...mockTransportRow,
                start_lat: '0',
                start_long: '0',
                des_lat: '0',
                des_long: '0'
            };

            const mockSelect = jest.fn().mockResolvedValue([mockTransportWithZeroCoords]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            const result = await blogTransportRepository.transportForBlog(blogId);

            expect(result[0].starting_point.lat).toBe(0);
            expect(result[0].starting_point.long).toBe(0);
            expect(result[0].destination_point.lat).toBe(0);
            expect(result[0].destination_point.long).toBe(0);
        });

        it('should test different transport types', async () => {
            const transportTypes = [
                { type: TransportType.BUS, name: 'Greyhound Bus' },
                { type: TransportType.TRAIN, name: 'Amtrak Train' },
                { type: TransportType.FLIGHT, name: 'Delta Flight' },
                { type: TransportType.BOAT, name: 'Ferry Service' },
                { type: TransportType.OTHER, name: 'Taxi Service' }
            ];

            for (const transport of transportTypes) {
                const mockTransportByType = {
                    ...mockTransportRow,
                    type: transport.type,
                    name: transport.name
                };

                const mockSelect = jest.fn().mockResolvedValue([mockTransportByType]);
                const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
                const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
                mockDb.mockReturnValue({ join: mockJoin });

                const result = await blogTransportRepository.transportForBlog(blogId);

                expect(result[0].type).toBe(transport.type);
                expect(result[0].name).toBe(transport.name);
            }
        });

        it('should use PostGIS ST_X and ST_Y functions correctly', async () => {
            const mockSelect = jest.fn().mockResolvedValue([mockTransportRow]);
            const mockWhere = jest.fn().mockReturnValue({ select: mockSelect });
            const mockJoin = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValue({ join: mockJoin });

            await blogTransportRepository.transportForBlog(blogId);

            expect(db.raw).toHaveBeenCalledWith('ST_X(transports.starting_point::geometry) as start_long');
            expect(db.raw).toHaveBeenCalledWith('ST_Y(transports.starting_point::geometry) as start_lat');
            expect(db.raw).toHaveBeenCalledWith('ST_X(transports.destination_point::geometry) as des_long');
            expect(db.raw).toHaveBeenCalledWith('ST_Y(transports.destination_point::geometry) as des_lat');
        });
    });
});