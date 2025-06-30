import { TransportRepository } from "../../../src/infrastructure/transport-impl";
import { TransportType } from "../../../src/interfaces/transport";
import { UUID } from "crypto";
import { db } from "../../../src/configs/db";

jest.mock("../../../src/configs/db", () => {
    const queryBuilder: any = {};
    queryBuilder.insert = jest.fn(() => queryBuilder);
    queryBuilder.returning = jest.fn(() => queryBuilder);
    queryBuilder.select = jest.fn(() => queryBuilder);
    queryBuilder.where = jest.fn(() => queryBuilder);
    queryBuilder.first = jest.fn(() => queryBuilder);
    queryBuilder.update = jest.fn(() => queryBuilder);
    queryBuilder.del = jest.fn(() => queryBuilder);
    queryBuilder.orderBy = jest.fn(() => queryBuilder);
    queryBuilder.orderByRaw = jest.fn(() => queryBuilder);
    queryBuilder.distinct = jest.fn(() => queryBuilder);
    queryBuilder.then = jest.fn();

    const dbFn: any = jest.fn(() => queryBuilder);
    dbFn.raw = jest.fn((sql, bindings?) => ({ __raw: true, sql, bindings }));

    return { db: dbFn };
});

describe("TransportRepository", () => {
    const repo = new TransportRepository();
    const now = new Date();
    const baseRow = {
        id: "uuid-1234" as UUID,
        type: TransportType.TRAIN,
        name: "Express Train",
        starting_location: "Dhaka",
        destination: "Chittagong",
        start_lat: "23.8103",
        start_long: "90.4125",
        des_lat: "22.3569",
        des_long: "91.7832",
        departure_time: now.toISOString(),
        arrival_time: now.toISOString(),
        fare: "1500.50",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
    };

    const expectedTransport = {
        id: baseRow.id,
        type: baseRow.type,
        name: baseRow.name,
        starting_location: baseRow.starting_location,
        destination: baseRow.destination,
        starting_point: {
            lat: parseFloat(baseRow.start_lat),
            long: parseFloat(baseRow.start_long),
        },
        destination_point: {
            lat: parseFloat(baseRow.des_lat),
            long: parseFloat(baseRow.des_long),
        },
        departure_time: baseRow.departure_time,
        arrival_time: baseRow.arrival_time,
        fare: baseRow.fare,
        created_at: new Date(baseRow.created_at),
        updated_at: new Date(baseRow.updated_at),
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should insert and return a transport", async () => {
            (db as any)().insert.mockReturnValueOnce({
                returning: jest.fn().mockResolvedValueOnce([baseRow]),
            });

            const input = {
                type: baseRow.type,
                name: baseRow.name,
                starting_location: baseRow.starting_location,
                destination: baseRow.destination,
                starting_point: { lat: 23.8103, long: 90.4125 },
                destination_point: { lat: 22.3569, long: 91.7832 },
                departure_time: baseRow.departure_time,
                arrival_time: baseRow.arrival_time,
                fare: baseRow.fare,
            };

            const result = await repo.create(input);
            expect(result).toEqual(expectedTransport);
        });
    });

    describe("getAll", () => {
        it("should return all transports", async () => {
            (db as any)().select.mockResolvedValueOnce([baseRow]);
            const result = await repo.getAll();
            expect(result).toEqual([expectedTransport]);
        });
    });

    describe("getById", () => {
        it("should return a transport by ID", async () => {
            (db as any)().select.mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    first: jest.fn().mockResolvedValueOnce(baseRow),
                }),
            });

            const result = await repo.getById(baseRow.id);
            expect(result).toEqual(expectedTransport);
        });

        it("should return null if transport not found", async () => {
            (db as any)().select.mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    first: jest.fn().mockResolvedValueOnce(null),
                }),
            });

            const result = await repo.getById("not-found-id" as UUID);
            expect(result).toBeNull();
        });

        it("should return null if DB returns undefined", async () => {
            (db as any)().select.mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    first: jest.fn().mockResolvedValueOnce(undefined),
                }),
            });

            const result = await repo.getById("undefined" as UUID);
            expect(result).toBeNull();
        });
    });

    describe("update", () => {
        it("should update with all fields", async () => {
            (db as any)().where.mockReturnValueOnce({
                update: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([baseRow])
                }),
            });

            const result = await repo.update(baseRow.id, {
                ...baseRow,
                starting_point: { lat: 23.81, long: 90.41 },
                destination_point: { lat: 22.36, long: 91.78 },
            });

            expect(result).toEqual(expectedTransport);
        });

        it("should update without coordinates", async () => {
            (db as any)().where.mockReturnValueOnce({
                update: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([baseRow])
                }),
            });

            const result = await repo.update(baseRow.id, {
                name: "Only Name Changed",
            });

            expect(result.name).toBe("Express Train");
        });
    });


    describe("delete", () => {
        it("should delete a transport and return count", async () => {
            (db as any)().where.mockReturnValueOnce({ del: jest.fn().mockResolvedValueOnce(1) });
            const result = await repo.delete("uuid-1234" as UUID);
            expect(result).toBe(1);
        });

        it("should return 0 when nothing is deleted", async () => {
            (db as any)().where.mockReturnValueOnce({ del: jest.fn().mockResolvedValueOnce(0) });
            const result = await repo.delete("non-existent-id" as UUID);
            expect(result).toBe(0);
        });
    });

    describe("allStratingLocations", () => {
        it("should return all unique starting locations", async () => {
            const row = { name: "Dhaka", lat: "23.81", long: "90.41" };
            (db as any)().distinct.mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce([row]),
            });

            const result = await repo.allStratingLocations();
            expect(result).toEqual([
                {
                    name: row.name,
                    location_point: {
                        lat: parseFloat(row.lat),
                        long: parseFloat(row.long),
                    },
                },
            ]);
        });
    });

    describe("allDestinationLocations", () => {
        it("should return all unique destination locations", async () => {
            const row = { name: "Chittagong", lat: "22.36", long: "91.78" };
            (db as any)().distinct.mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce([row]),
            });

            const result = await repo.allDestinationLocations();
            expect(result).toEqual([
                {
                    name: row.name,
                    location_point: {
                        lat: parseFloat(row.lat),
                        long: parseFloat(row.long),
                    },
                },
            ]);
        });
    });

    describe("search", () => {
        it("should return filtered transports", async () => {
            const queryBuilder = {
                select: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderByRaw: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb([baseRow])),
            };
            (db as any).mockReturnValue(queryBuilder);

            const result = await repo.search({
                startingLocationName: "Dhaka",
                destinationLocationName: "Chittagong",
                type: "TRAIN",
                name: "Express",
                sortBy: "fare",
                order: "asc",
            });

            expect(result).toEqual([expectedTransport]);
        });

        it("should return all transports when no filters are provided", async () => {
            const queryBuilder = {
                select: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb([baseRow])),
            };
            (db as any).mockReturnValue(queryBuilder);

            const result = await repo.search({});
            expect(result).toEqual([expectedTransport]);
        });

        it("should ignore invalid type", async () => {
            const queryBuilder = {
                select: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb([baseRow])),
            };
            (db as any).mockReturnValue(queryBuilder);

            const result = await repo.search({ type: "INVALID_TYPE" });
            expect(result).toEqual([expectedTransport]);
        });

        it("should sort by created_at if sortBy is not 'fare'", async () => {
            const queryBuilder = {
                select: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb([baseRow])),
            };
            (db as any).mockReturnValue(queryBuilder);

            const result = await repo.search({ sortBy: undefined });
            expect(result).toEqual([expectedTransport]);
        });
    });
});
