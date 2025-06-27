import { LodgeService } from "../../src/services/lodge";
import { ILodgeRepositiry } from "../../src/repositories/lodge";
import { UUID } from "crypto";
import { Lodge } from "../../src/interfaces/lodge";
import { NotFoundException } from "../../src/exceptions/not-found";
import { ErrorCode } from "../../src/exceptions/root";

const mockLodgeRepository: jest.Mocked<ILodgeRepositiry> = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  allLocations: jest.fn(),
};

const now = new Date();
const lodge: Lodge = {
  id: "lodge-uuid" as UUID,
  name: "Seaview Paradise",
  location_name: "Chattogram",
  location_point: { lat: 22.3569, long: 91.7832 },
  price: 3500,
  description: "Cozy room with sea view",
  cover_image: "http://example.com/image.jpg",
  created_at: now,
  updated_at: now,
};

describe("LodgeService", () => {
  const service = new LodgeService(mockLodgeRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLodge", () => {
    it("should create and return lodge response DTO", async () => {
      mockLodgeRepository.create.mockResolvedValue(lodge);

      const result = await service.createLodge(lodge);

      expect(mockLodgeRepository.create).toHaveBeenCalledWith(lodge);
      expect(result).toMatchObject({ id: lodge.id, name: lodge.name });
    });
  });

  describe("getAllLodges", () => {
    it("should return all lodges as DTOs", async () => {
      mockLodgeRepository.getAll.mockResolvedValue([lodge]);

      const result = await service.getAllLodges();

      expect(mockLodgeRepository.getAll).toHaveBeenCalled();
      expect(result[0].id).toBe(lodge.id);
    });
  });

  describe("getLodgeById", () => {
    it("should return lodge if found", async () => {
      mockLodgeRepository.getById.mockResolvedValue(lodge);

      const result = await service.getLodgeById(lodge.id);

      expect(mockLodgeRepository.getById).toHaveBeenCalledWith(lodge.id);
      expect(result).toMatchObject({ id: lodge.id });
    });

    it("should throw NotFoundException if lodge is not found", async () => {
      mockLodgeRepository.getById.mockResolvedValue(null);

      await expect(service.getLodgeById("missing-id" as UUID)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateLodge", () => {
    it("should update and return lodge", async () => {
      mockLodgeRepository.getById.mockResolvedValue(lodge);
      mockLodgeRepository.update.mockResolvedValue({ ...lodge, name: "Updated" });

      const result = await service.updateLodge(lodge.id, { name: "Updated" });

      expect(mockLodgeRepository.update).toHaveBeenCalledWith(lodge.id, { name: "Updated" });
      expect(result.name).toBe("Updated");
    });

    it("should throw NotFoundException if lodge not found", async () => {
      mockLodgeRepository.getById.mockResolvedValue(null);

      await expect(service.updateLodge(lodge.id, { name: "New Name" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteLodge", () => {
    it("should call delete if lodge exists", async () => {
      mockLodgeRepository.getById.mockResolvedValue(lodge);

      await service.deleteLodge(lodge.id);

      expect(mockLodgeRepository.delete).toHaveBeenCalledWith(lodge.id);
    });

    it("should throw NotFoundException if lodge not found", async () => {
      mockLodgeRepository.getById.mockResolvedValue(null);

      await expect(service.deleteLodge(lodge.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getAllLocations", () => {
    it("should return all lodge locations", async () => {
      const locations = [
        { name: "Beach Resort", location_point: { lat: 21.0, long: 90.0 } },
      ];
      mockLodgeRepository.allLocations.mockResolvedValue(locations);

      const result = await service.getAllLocations();

      expect(mockLodgeRepository.allLocations).toHaveBeenCalled();
      expect(result).toEqual(locations);
    });
  });

  describe("searchLodge", () => {
    it("should return lodges matching the search", async () => {
      mockLodgeRepository.search.mockResolvedValue([lodge]);

      const result = await service.searchLodge({ location_name: "Chattogram" });

      expect(mockLodgeRepository.search).toHaveBeenCalledWith({ location_name: "Chattogram" });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(lodge.id);
    });
  });
});
