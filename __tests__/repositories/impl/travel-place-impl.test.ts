import { TravelPlaceRepository } from "../../../src/repositories/impl/travel-place-impl";
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
    queryBuilder.whereILike = jest.fn(() => queryBuilder);
    queryBuilder.whereRaw = jest.fn(() => queryBuilder);
    queryBuilder.then = jest.fn((cb) => cb([mockRow]));

    const dbFn: any = jest.fn(() => queryBuilder);
    dbFn.raw = jest.fn((sql, bindings?) => ({ __raw: true, sql, bindings }));

    return { db: dbFn };
});

const repo = new TravelPlaceRepository();
const now = new Date();

const mockRow = {
    id: "uuid-1234" as UUID,
    user_id: "uuid-user" as UUID,
    name: "Sundarbans",
    location_name: "Khulna",
    cover_image: "image.jpg",
    description: "Mangrove forest",
    tags: '["forest","nature"]',
    lat: "22.1234",
    long: "89.1234",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
};

const expectedPlace = {
    id: mockRow.id,
    user_id: mockRow.user_id,
    name: mockRow.name,
    location_name: mockRow.location_name,
    cover_image: mockRow.cover_image,
    description: mockRow.description,
    tags: mockRow.tags,
    location_point: {
        lat: parseFloat(mockRow.lat),
        long: parseFloat(mockRow.long),
    },
    created_at: new Date(mockRow.created_at),
    updated_at: new Date(mockRow.updated_at),
};

describe("TravelPlaceRepository", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create and return travel place", async () => {
            (db as any)().insert.mockReturnValueOnce({
                returning: jest.fn().mockResolvedValueOnce([mockRow]),
            });

            const result = await repo.create("uuid-user" as UUID, {
                name: mockRow.name,
                location_name: mockRow.location_name,
                location_point: { lat: 22.1234, long: 89.1234 },
                cover_image: mockRow.cover_image,
                description: mockRow.description,
                tags: ["forest", "nature"],
            });

            expect(result).toEqual(expectedPlace);
        });
    });

    describe("getAll", () => {
        it("should return all travel places", async () => {
            (db as any)().select.mockResolvedValueOnce([mockRow]);
            const result = await repo.getAll();
            expect(result).toEqual([expectedPlace]);
        });
    });

    describe("getById", () => {
        it("should return travel place by id", async () => {
            (db as any)().where.mockReturnValueOnce({
                first: jest.fn().mockResolvedValueOnce(mockRow),
            });

            const result = await repo.getById(mockRow.id);
            expect(result).toEqual(expectedPlace);
        });

        it("should return null if not found", async () => {
            (db as any)().where.mockReturnValueOnce({
                first: jest.fn().mockResolvedValueOnce(null),
            });

            const result = await repo.getById("not-found-id" as UUID);
            expect(result).toBeNull();
        });
    });

    describe("update", () => {
        it("should update with coordinates and tags", async () => {
            (db as any)().where.mockReturnValueOnce({
                update: jest.fn(() => ({
                    returning: jest.fn().mockResolvedValueOnce([mockRow]),
                })),
            });

            const result = await repo.update(mockRow.id, {
                name: "Updated Place",
                location_point: { lat: 22.1234, long: 89.1234 },
                tags: ["nature"],
            });

            expect(result).toEqual(expectedPlace);
        });

        it("should update without coordinates", async () => {
            (db as any)().where.mockReturnValueOnce({
                update: jest.fn(() => ({
                    returning: jest.fn().mockResolvedValueOnce([mockRow]),
                })),
            });

            const result = await repo.update(mockRow.id, {
                name: "No Coordinate Update",
            });

            expect(result.name).toBe(mockRow.name);
        });
    });

    describe("delete", () => {
        it("should delete by id", async () => {
            (db as any)().where.mockReturnValueOnce({
                del: jest.fn().mockResolvedValueOnce(1),
            });

            const result = await repo.delete(mockRow.id);
            expect(result).toBeUndefined();
        });
    });

    describe("search", () => {
        it("should return filtered results by tag", async () => {
            (db as any).mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                whereRaw: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb([mockRow])),
            });

            const result = await repo.search({
                name: "Sundarbans",
                tag: "forest",
                sortBy: "name",
                order: "asc",
            });

            expect(result).toEqual([expectedPlace]);
        });

        it("should apply default sort if sortBy invalid", async () => {
            (db as any).mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                whereILike: jest.fn().mockReturnThis(),
                whereRaw: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                then: jest.fn((cb) => cb([mockRow])),
            });

            const result = await repo.search({ name: "Sundarbans" });
            expect(result).toEqual([expectedPlace]);
        });
    });
});
