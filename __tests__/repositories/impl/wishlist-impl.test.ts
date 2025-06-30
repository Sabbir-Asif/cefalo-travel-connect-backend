import { WishlistRepository } from "../../../src/infrastructure/wishlist-impl";
import { UUID } from "crypto";
import { db } from "../../../src/configs/db";
import { WishlistStatus } from "../../../src/interfaces/wishlist";

const now = new Date();
const repo = new WishlistRepository();

const mockUser = {
    id: "uuid-user-1" as UUID,
    name: "Alice",
    email: "alice@example.com",
    phone_number: "123456789",
    role: "TRAVELER",
    displayPicture: null,
    bio: null,
    is_verified: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
};

const mockRow = {
    id: "uuid-wishlist-1" as UUID,
    user_id: mockUser.id,
    title: "My wishlist",
    location_name: "Paris",
    lat: 48.8566,
    long: 2.3522,
    travel_date: now.toISOString(),
    tags: ['europe', 'summer'],
    note: "Vacation trip",
    blog_id: null,
    travel_place_id: null,
    cover_image: null,
    status: WishlistStatus.PUBLIC,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    user: mockUser,
};

jest.mock("../../../src/configs/db", () => {
    const chain: any = {
        insert: jest.fn(() => chain),
        returning: jest.fn(() => Promise.resolve([mockRow])),
        select: jest.fn(() => chain),
        from: jest.fn(() => chain),
        leftJoin: jest.fn(() => chain),
        where: jest.fn(() => chain),
        whereILike: jest.fn(() => chain),
        whereRaw: jest.fn(() => chain),
        orderBy: jest.fn(() => chain),
        update: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([mockRow])),
        })),
        del: jest.fn(() => Promise.resolve(1)),
        first: jest.fn(() => Promise.resolve(mockRow)),
        then: jest.fn((resolve) => resolve([mockRow])),
    };

    const dbFn: any = jest.fn(() => chain);
    Object.assign(dbFn, {
        select: jest.fn(() => chain),
        from: jest.fn(() => chain),
        leftJoin: jest.fn(() => chain),
        where: jest.fn(() => chain),
        whereILike: jest.fn(() => chain),
        whereRaw: jest.fn(() => chain),
        orderBy: jest.fn(() => chain),
        raw: jest.fn(() => ({})),
    });

    return { db: dbFn };
});

describe("WishlistRepository", () => {
    afterEach(() => jest.clearAllMocks());

    describe("create", () => {
        it("creates and returns a wishlist", async () => {
            const result = await repo.create(mockUser.id, {
                title: "My wishlist",
                location_name: "Paris",
                location_point: { lat: 48.8566, long: 2.3522 },
                travel_date: now,
                tags: ['europe', 'summer'],
                note: "Vacation trip",
                status: WishlistStatus.PUBLIC,
            });

            expect(result.title).toBe("My wishlist");
            expect(result.location_point.lat).toBeCloseTo(48.8566);
            expect(result.tags).toEqual(['europe', 'summer']);
        });

        it("throws error if insert fails", async () => {
            (db as any)().insert.mockImplementationOnce(() => {
                throw new Error("Insert failed");
            });
            await expect(repo.create(mockUser.id, {
                title: "Fail",
                location_name: "Fail",
                location_point: { lat: 0, long: 0 },
                travel_date: now,
            })).rejects.toThrow("Insert failed");
        });
    });

    describe("getAll", () => {
        it("returns all wishlists with users", async () => {
            const result = await repo.getAll();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].user.name).toBe("Alice");
        });

        it("returns empty array if no wishlists", async () => {
            (db as any)().then.mockImplementationOnce((resolve: (arg0: never[]) => any) => resolve([]));
            const result = await repo.getAll();
            expect(result).toEqual([]);
        });

    });

    describe("getById", () => {
        it("returns a wishlist with user by id", async () => {
            const result = await repo.getById(mockRow.id);
            expect(result?.id).toBe(mockRow.id);
            expect(result?.user.email).toBe(mockUser.email);
        });

        it("returns null if wishlist not found", async () => {
            (db as any)().first.mockResolvedValueOnce(null);
            const result = await repo.getById("non-existent-id" as UUID);
            expect(result).toBeNull();
        });

        it("throws if DB fails", async () => {
            (db as any)().first.mockRejectedValueOnce(new Error("DB failure"));
            await expect(repo.getById(mockRow.id)).rejects.toThrow("DB failure");
        });
    });

    describe("getByUserId", () => {
        it("returns wishlists for given user", async () => {
            const result = await repo.getByUserId(mockUser.id);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].user_id).toBe(mockUser.id);
        });

        it("returns empty array if no wishlists for user", async () => {
            (db as any)().select.mockImplementationOnce(() => ({
                where: jest.fn(() => Promise.resolve([])),
            }));
            const result = await repo.getByUserId("unknown-user" as UUID);
            expect(result).toEqual([]);
        });
    });

    describe("update", () => {
        it("updates and returns wishlist", async () => {
            const result = await repo.update(mockRow.id, {
                title: "Updated title",
                tags: ['updated'],
                location_point: { lat: 1, long: 1 },
            });
            expect(result.title).toBe(mockRow.title); // because mock returns same row
            expect(result.tags).toEqual(mockRow.tags);
        });


        it("throws if update fails", async () => {
            (db as any)().where.mockReturnValueOnce({
                update: jest.fn(() => {
                    throw new Error("Update failed");
                }),
            });
            await expect(repo.update(mockRow.id, { title: "Fail" })).rejects.toThrow("Update failed");
        });
    });

    describe("delete", () => {
        it("deletes a wishlist", async () => {
            const result = await repo.delete(mockRow.id);
            expect(result).toBeUndefined();
        });

        it("handles zero rows deleted gracefully", async () => {
            (db as any)().where.mockReturnValueOnce({
                del: jest.fn(() => Promise.resolve(0)),
            });
            const result = await repo.delete(mockRow.id);
            expect(result).toBeUndefined();
        });

        it("throws if delete fails", async () => {
            (db as any)().where.mockReturnValueOnce({
                del: jest.fn(() => {
                    throw new Error("Delete failed");
                }),
            });
            await expect(repo.delete(mockRow.id)).rejects.toThrow("Delete failed");
        });
    });

    describe("search", () => {
        it("returns filtered results by title", async () => {
            const result = await repo.search({ title: "My wishlist" });
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].title).toContain("wishlist");
        });

        it("returns filtered results by location_name", async () => {
            const result = await repo.search({ location_name: "Paris" });
            expect(result.length).toBeGreaterThan(0);
        });

        it("returns filtered results by tag", async () => {
            const result = await repo.search({ tag: "summer" });
            expect(result.length).toBeGreaterThan(0);
        });

        it("returns filtered results by status", async () => {
            const result = await repo.search({ status: WishlistStatus.PUBLIC });
            expect(result.length).toBeGreaterThan(0);
        });

        it("returns results sorted by a field ascending", async () => {
            const result = await repo.search({ sortBy: "title", order: "asc" });
            expect(result.length).toBeGreaterThan(0);
        });

        it("returns results sorted by default created_at desc", async () => {
            const result = await repo.search({});
            expect(result.length).toBeGreaterThan(0);
        });

        it("returns empty array if no match", async () => {
            (db as any)().then.mockImplementationOnce((resolve: (arg0: never[]) => any) => resolve([]));
            const result = await repo.search({ title: "no-match" });
            expect(result).toEqual([]);
        });

        it("throws if search fails", async () => {
            (db as any)().then.mockImplementationOnce(() => {
                throw new Error("Search failed");
            });
            await expect(repo.search({})).rejects.toThrow("Search failed");
        });
    });
});
