import { TravelPlanRepository } from "../../../src/repositories/impl/travel-plan-impl";
import { TravelPlanStatus } from "../../../src/interfaces/travel-plan";
import { db } from "../../../src/configs/db";
import { UUID } from "crypto";

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
    queryBuilder.then = jest.fn((cb) => cb([mockRow]));
    const dbFn: any = jest.fn(() => queryBuilder);
    dbFn.raw = jest.fn((sql, bindings?) => ({ __raw: true, sql, bindings }));
    return { db: dbFn };
});

const repo = new TravelPlanRepository();
const now = new Date();

const mockRow = {
    id: "uuid-1" as UUID,
    planner_id: "uuid-user" as UUID,
    title: "Trip to Sundarbans",
    starting_point_name: "Dhaka",
    start_lat: "23.8103",
    start_long: "90.4125",
    destination_name: "Khulna",
    dest_lat: "22.8456",
    dest_long: "89.5403",
    starting_date: now.toISOString(),
    ending_date: now.toISOString(),
    budget: "15000",
    description: "A trip to the beautiful mangroves",
    status: TravelPlanStatus.ACTIVE,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
};

const expectedPlan = {
    id: mockRow.id,
    planner_id: mockRow.planner_id,
    title: mockRow.title,
    starting_point_name: mockRow.starting_point_name,
    starting_point_location: {
        lat: parseFloat(mockRow.start_lat),
        long: parseFloat(mockRow.start_long),
    },
    destination_name: mockRow.destination_name,
    destination_location: {
        lat: parseFloat(mockRow.dest_lat),
        long: parseFloat(mockRow.dest_long),
    },
    starting_date: new Date(mockRow.starting_date),
    ending_date: new Date(mockRow.ending_date),
    budget: parseFloat(mockRow.budget),
    description: mockRow.description,
    status: mockRow.status,
    created_at: new Date(mockRow.created_at),
    updated_at: new Date(mockRow.updated_at)
};

describe("TravelPlanRepository", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create and return a travel plan", async () => {
            (db as any)().insert.mockReturnValueOnce({
                returning: jest.fn().mockResolvedValueOnce([mockRow])
            });

            const result = await repo.create("uuid-user" as UUID, {
                title: mockRow.title,
                starting_point_name: mockRow.starting_point_name,
                starting_point_location: { lat: 23.8103, long: 90.4125 },
                destination_name: mockRow.destination_name,
                destination_location: { lat: 22.8456, long: 89.5403 },
                starting_date: mockRow.starting_date,
                ending_date: mockRow.ending_date,
                budget: 15000,
                description: mockRow.description,
                status: TravelPlanStatus.ACTIVE
            });

            expect(result).toEqual(expectedPlan);
        });
    });

    describe("getAll", () => {
        it("should return all travel plans", async () => {
            (db as any)().select.mockResolvedValueOnce([mockRow]);
            const result = await repo.getAll();
            expect(result).toEqual([expectedPlan]);
        });
    });

    describe("getById", () => {
        it("should return travel plan by id", async () => {
            (db as any)().where.mockReturnValueOnce({
                first: jest.fn().mockResolvedValueOnce(mockRow)
            });
            const result = await repo.getById("uuid-1" as UUID);
            expect(result).toEqual(expectedPlan);
        });

        it("should return null if not found", async () => {
            (db as any)().where.mockReturnValueOnce({
                first: jest.fn().mockResolvedValueOnce(null)
            });
            const result = await repo.getById("uuid-404" as UUID);
            expect(result).toBeNull();
        });
    });

    describe("update", () => {
        it("should update and return updated travel plan", async () => {
            (db as any)().where.mockReturnValueOnce({
                update: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([mockRow])
                })
            });

            const result = await repo.update("uuid-1" as UUID, {
                title: "Updated title",
                destination_location: { lat: 22.8456, long: 89.5403 }
            });

            expect(result).toEqual(expectedPlan);
        });
    });

    describe("delete", () => {
        it("should delete the travel plan", async () => {
            (db as any)().where.mockReturnValueOnce({
                del: jest.fn().mockResolvedValueOnce(1)
            });

            await expect(repo.delete("uuid-1" as UUID)).resolves.toBeUndefined();
        });
    });

    describe("search", () => {
        it("should return filtered travel plans", async () => {
            (db as any)().select.mockReturnThis();
            (db as any)().whereILike.mockReturnThis();
            (db as any)().where.mockReturnThis();
            (db as any)().orderBy.mockReturnThis();
            (db as any)().then = jest.fn((cb) => cb([mockRow]));

            const result = await repo.search({
                title: "Sundarbans",
                status: TravelPlanStatus.ACTIVE,
                sortBy: "created_at",
                order: "asc"
            });

            expect(result).toEqual([expectedPlan]);
        });
    });
});
