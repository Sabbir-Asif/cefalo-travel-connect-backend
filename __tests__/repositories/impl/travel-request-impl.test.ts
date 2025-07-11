import { TravelRequestRepository } from "../../../src/infrastructure/travel-request-impl";
import { UUID } from "crypto";
import { db } from "../../../src/configs/db";
import { TravelRequestStatus } from "../../../src/interfaces/travel-request";

const now = new Date();
const repo = new TravelRequestRepository();

const mockRow = {
  id: "uuid-req-1" as UUID,
  travel_plan_id: "uuid-plan-1" as UUID,
  user_from: "uuid-user-1" as UUID,
  user_to: "uuid-user-2" as UUID,
  title: "Join request",
  message: "Can I join?",
  status: TravelRequestStatus.PENDING,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
  from_user: {
    id: "uuid-user-1",
    name: "Alice",
    email: "alice@example.com",
    password: "hashed",
    phone_number: "123456789",
    role: "TRAVELER",
    displayPicture: null,
    bio: null,
    is_verified: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  to_user: {
    id: "uuid-user-2",
    name: "Bob",
    email: "bob@example.com",
    password: "hashed",
    phone_number: "987654321",
    role: "EXPLORER",
    displayPicture: null,
    bio: null,
    is_verified: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
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
    orderBy: jest.fn(() => chain),
    raw: jest.fn(() => ({})),
  });

  return { db: dbFn };
});

describe("TravelRequestRepository", () => {
  afterEach(() => jest.clearAllMocks());

  describe("create", () => {
    it("should create and return a travel request", async () => {
      const result = await repo.create("uuid-user-1" as UUID, {
        travel_plan_id: "uuid-plan-1" as UUID,
        user_to: "uuid-user-2" as UUID,
        title: "Join request",
        message: "Can I join?",
      });
      expect(result.title).toBe("Join request");
      expect(result.status).toBe("PENDING");
    });

    it("should throw if DB insert fails", async () => {
      (db as any)().insert.mockImplementationOnce(() => {
        throw new Error("DB insert error");
      });
      await expect(
        repo.create("uuid-user-1" as UUID, {
          travel_plan_id: "uuid-plan-1" as UUID,
          user_to: "uuid-user-2" as UUID,
          title: "Join request",
          message: "Can I join?",
        }),
      ).rejects.toThrow("DB insert error");
    });
  });

  describe("getAll", () => {
    it("should return all travel requests with users", async () => {
      const result = await repo.getAll();
      expect(result[0].from_user.name).toBe("Alice");
      expect(result[0].to_user.name).toBe("Bob");
    });

    it("should return empty array if no travel requests", async () => {
      (db as any)().then.mockImplementationOnce((resolve: (arg0: never[]) => any) => resolve([]));
      const result = await repo.getAll();
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return a travel request with users", async () => {
      const result = await repo.getById("uuid-req-1" as UUID);
      expect(result?.id).toBe("uuid-req-1");
      expect(result?.from_user.email).toBe("alice@example.com");
    });

    it("should return null if travel request not found", async () => {
      (db as any)().first.mockResolvedValueOnce(null);
      const result = await repo.getById("non-existent-id" as UUID);
      expect(result).toBeNull();
    });

    it("should throw if DB fails", async () => {
      (db as any)().first.mockRejectedValueOnce(new Error("DB failure"));
      await expect(repo.getById("uuid-req-1" as UUID)).rejects.toThrow("DB failure");
    });
  });

  describe("update", () => {
    it("should update and return the updated travel request", async () => {
      const result = await repo.update("uuid-req-1" as UUID, {
        title: "Updated title",
        message: "Updated message",
        status: TravelRequestStatus.ACCEPTED,
      });
      expect(result.title).toBe("Join request");
    });

    it("should throw if update fails", async () => {
      (db as any)().where.mockReturnValueOnce({
        update: jest.fn(() => {
          throw new Error("Update failed");
        }),
      });
      await expect(
        repo.update("uuid-req-1" as UUID, { status: TravelRequestStatus.ACCEPTED }),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("delete", () => {
    it("should delete the travel request", async () => {
      const result = await repo.delete("uuid-req-1" as UUID);
      expect(result).toBeUndefined();
    });

    it("should handle no rows deleted gracefully", async () => {
      (db as any)().where.mockReturnValueOnce({
        del: jest.fn(() => Promise.resolve(0)),
      });
      const result = await repo.delete("uuid-req-1" as UUID);
      expect(result).toBeUndefined();
    });

    it("should throw if delete fails", async () => {
      (db as any)().where.mockReturnValueOnce({
        del: jest.fn(() => {
          throw new Error("Delete failed");
        }),
      });
      await expect(repo.delete("uuid-req-1" as UUID)).rejects.toThrow("Delete failed");
    });
  });

  describe("search", () => {
    it("should return filtered results with filters", async () => {
      const result = await repo.search({
        title: "Join",
        user_from: "uuid-user-1",
        user_to: "uuid-user-2",
        status: TravelRequestStatus.PENDING,
        sortBy: "created_at",
        order: "desc",
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toContain("Join");
    });

    it("should return all results with empty filters", async () => {
      const result = await repo.search({});
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe("uuid-req-1");
    });

    it("should handle no results found", async () => {
      (db as any)().then.mockImplementationOnce((resolve: (arg0: never[]) => any) => resolve([]));
      const result = await repo.search({ title: "non-existent" });
      expect(result).toEqual([]);
    });

    it("should throw if search fails", async () => {
      (db as any)().then.mockImplementationOnce(() => {
        throw new Error("Search failed");
      });
      await expect(repo.search({})).rejects.toThrow("Search failed");
    });
  });
});
