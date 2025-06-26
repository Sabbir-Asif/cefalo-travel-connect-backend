import { TourTransportRepository } from '../../../src/repositories/impl/tour-transport-impl';
import { UUID } from 'crypto';
import { TransportType } from '../../../src/interfaces/transport';
import {
    CreateTourTransport,
    UpdateTourTransport,
    TourTransportWithTransport,
} from '../../../src/interfaces/tour-transport';

jest.mock('../../../src/configs/db', () => {
    const mDb: any = jest.fn();
    mDb.raw = jest.fn().mockImplementation((...args) => ({
        __raw: true,
        sql: args[0],
        bindings: args[1],
    }));
    return { db: mDb };
});

import { db } from '../../../src/configs/db';

describe('TourTransportRepository', () => {
    let tourTransportRepository: TourTransportRepository;
    let mockDb: jest.MockedFunction<any>;

    const now = new Date();

    const tourTransportRow = {
        id: 'tour-transport-id' as UUID,
        travelplan_id: 'travelplan-id' as UUID,
        transport_id: 'transport-id' as UUID,
        departure_time: now,
        contact_number: '01700000000',
        created_at: now,
        updated_at: now,
        transport: {
            id: 'transport-id' as UUID,
            type: TransportType.TRAIN,
            name: 'Intercity Express',
            starting_location: 'Dhaka',
            starting_point: { lat: 23.7, long: 90.4 },
            destination: 'Chittagong',
            destination_point: { lat: 22.3, long: 91.8 },
            departure_time: now,
            arrival_time: now,
            fare: '1000',
            created_at: now,
            updated_at: now,
        },
    };

    const expectedTransport: TourTransportWithTransport = {
        ...tourTransportRow,
        departure_time: now,
        created_at: now,
        updated_at: now,
        transport: {
            ...tourTransportRow.transport,
            departure_time: now,
            arrival_time: now,
            created_at: now,
            updated_at: now,
        },
    };

    beforeEach(() => {
        tourTransportRepository = new TourTransportRepository();
        mockDb = db as jest.MockedFunction<any>;
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert and return created TourTransportWithTransport', async () => {
            const mockReturning = jest.fn().mockResolvedValue([tourTransportRow]);
            const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockWhere = jest.fn().mockReturnValue({ first: jest.fn().mockResolvedValue(tourTransportRow) });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });

            mockDb.mockReturnValueOnce({ insert: mockInsert });
            mockDb.mockReturnValueOnce({ select: mockSelect });

            const input: CreateTourTransport = {
                travelplan_id: tourTransportRow.travelplan_id,
                transport_id: tourTransportRow.transport_id,
                departure_time: now,
                contact_number: tourTransportRow.contact_number,
            };

            const result = await tourTransportRepository.create(input);

            expect(mockDb).toHaveBeenCalledWith('tour_transports');
            expect(mockInsert).toHaveBeenCalledWith(input);
            expect(mockReturning).toHaveBeenCalledWith('*');
            expect(result).toEqual(expectedTransport);
        });

        it('should throw error if insert fails', async () => {
            const mockInsert = jest.fn().mockImplementation(() => { throw new Error('Insert failed'); });
            mockDb.mockReturnValueOnce({ insert: mockInsert });

            await expect(
                tourTransportRepository.create({
                    travelplan_id: tourTransportRow.travelplan_id,
                    transport_id: tourTransportRow.transport_id,
                    departure_time: now,
                    contact_number: tourTransportRow.contact_number,
                })
            ).rejects.toThrow('Insert failed');
        });
    });

    describe('getAll', () => {
        it('should return all tour transports with transport info', async () => {
            const mockOrderBy = jest.fn().mockResolvedValue([tourTransportRow]);
            const mockLeftJoin = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
            const mockSelect = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });

            mockDb.mockReturnValue({ select: mockSelect });

            const result = await tourTransportRepository.getAll();

            expect(mockDb).toHaveBeenCalledWith('tour_transports');
            expect(result).toEqual([expectedTransport]);
        });

        it('should return empty array if no tour transports exist', async () => {
            const mockOrderBy = jest.fn().mockResolvedValue([]);
            const mockLeftJoin = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
            const mockSelect = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });

            mockDb.mockReturnValue({ select: mockSelect });

            const result = await tourTransportRepository.getAll();
            expect(result).toEqual([]);
        });

    });

    describe('getById', () => {
        it('should return a tour transport by id', async () => {
            const mockWhere = jest.fn().mockReturnValue({ first: jest.fn().mockResolvedValue(tourTransportRow) });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });

            mockDb.mockReturnValue({ select: mockSelect });

            const result = await tourTransportRepository.getById(tourTransportRow.id);

            expect(mockDb).toHaveBeenCalledWith('tour_transports');
            expect(result).toEqual(expectedTransport);
        });

        it('should return null if not found', async () => {
            const mockWhere = jest.fn().mockReturnValue({ first: jest.fn().mockResolvedValue(null) });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere });
            const mockSelect = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });

            mockDb.mockReturnValue({ select: mockSelect });

            const result = await tourTransportRepository.getById('non-existent-id' as UUID);
            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update and return updated TourTransportWithTransport', async () => {
            const mockReturning = jest.fn().mockResolvedValue([tourTransportRow]);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockUpdate = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValueOnce({ update: mockUpdate });

            const mockWhere2 = jest.fn().mockReturnValue({ first: jest.fn().mockResolvedValue(tourTransportRow) });
            const mockLeftJoin = jest.fn().mockReturnValue({ where: mockWhere2 });
            const mockSelect = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin });
            mockDb.mockReturnValueOnce({ select: mockSelect });

            const input: UpdateTourTransport = {
                contact_number: '01812345678',
                departure_time: now,
            };

            const result = await tourTransportRepository.update(tourTransportRow.id, input);
            expect(result).toEqual(expectedTransport);
        });

        it('should throw error if update returns no rows', async () => {
            const mockReturning = jest.fn().mockResolvedValue([]);
            const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
            const mockUpdate = jest.fn().mockReturnValue({ where: mockWhere });
            mockDb.mockReturnValueOnce({ update: mockUpdate });

            await expect(
                tourTransportRepository.update(tourTransportRow.id, {
                    contact_number: '01812345678',
                    departure_time: now,
                })
            ).rejects.toThrow();
        });

    });

    describe('delete', () => {
        it('should delete the tour transport entry', async () => {
            const mockDel = jest.fn().mockResolvedValue(1);
            const mockWhere = jest.fn().mockReturnValue({ del: mockDel });

            mockDb.mockReturnValue({ where: mockWhere });

            await expect(tourTransportRepository.delete(tourTransportRow.id)).resolves.toBeUndefined();
            expect(mockDel).toHaveBeenCalled();
        });
    });

    describe('search', () => {
        it('should search and return filtered results', async () => {
            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (cb: any) => cb([tourTransportRow]),
            };

            mockDb.mockReturnValue(mockQuery);

            const result = await tourTransportRepository.search({
                travelplan_id: tourTransportRow.travelplan_id,
                transport_id: tourTransportRow.transport_id,
                contact_number: '017',
                sortBy: 'created_at',
                order: 'desc',
            });

            expect(result).toEqual([expectedTransport]);
            expect(mockQuery.where).toHaveBeenCalledWith('tour_transports.travelplan_id', tourTransportRow.travelplan_id);
            expect(mockQuery.where).toHaveBeenCalledWith('tour_transports.transport_id', tourTransportRow.transport_id);
            expect(mockQuery.whereILike).toHaveBeenCalledWith('tour_transports.contact_number', '%017%');
            expect(mockQuery.orderBy).toHaveBeenCalledWith('tour_transports.created_at', 'desc');
        });

        it('should return empty array when no match found', async () => {
            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (cb: any) => cb([]),
            };

            mockDb.mockReturnValue(mockQuery);

            const result = await tourTransportRepository.search({
                contact_number: 'notfound',
            });

            expect(result).toEqual([]);
            expect(mockQuery.whereILike).toHaveBeenCalledWith('tour_transports.contact_number', '%notfound%');
        });

        it('should handle search with only transport_id', async () => {
            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (cb: any) => cb([tourTransportRow]),
            };

            mockDb.mockReturnValue(mockQuery);

            const result = await tourTransportRepository.search({
                transport_id: tourTransportRow.transport_id,
            });

            expect(result).toEqual([expectedTransport]);
            expect(mockQuery.where).toHaveBeenCalledWith('tour_transports.transport_id', tourTransportRow.transport_id);
        });

        it('should use default sortBy and order if not provided', async () => {
            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                then: (cb: any) => cb([tourTransportRow]),
            };

            mockDb.mockReturnValue(mockQuery);

            const result = await tourTransportRepository.search({});
            expect(result).toEqual([expectedTransport]);
            expect(mockQuery.orderBy).toHaveBeenCalledWith('tour_transports.created_at', 'desc');
        });

    });

});
