import { TourLodgeService } from "../../src/services/tour-lodge";
import { TourLodgeDto } from "../../src/dtos/tour-lodge";
import { LodgeResponseDto } from "../../src/dtos/lodge";
import { NotFoundException } from "../../src/exceptions/not-found";
import { ErrorCode } from "../../src/exceptions/root";
import { UUID } from "crypto";

const mockTravelPlan = {
  id: "travelplan-uuid" as UUID,
  name: "Sylhet Tour"
};

const mockLodge = {
  id: "lodge-uuid" as UUID,
  name: "Green Resort",
  location_name: "Sylhet",
  location_point: { lat: 24.9, long: 91.9 },
  price: 3000,
  description: "Peaceful place",
  cover_image: null,
  created_at: new Date(),
  updated_at: new Date()
};

const mockTourLodge = {
  travelplan_id: "travelplan-uuid" as UUID,
  lodge_id: "lodge-uuid" as UUID
};

describe("TourLodgeService", () => {
  const tourLodgeRepository = {
    create: jest.fn(),
    delete: jest.fn(),
    lodgesForTravelPlan: jest.fn()
  };

  const travelPlanRepository = {
    getById: jest.fn()
  };

  const lodgeRepository = {
    getById: jest.fn()
  };

  let service: TourLodgeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TourLodgeService(
      tourLodgeRepository as any,
      travelPlanRepository as any,
      lodgeRepository as any
    );
  });

  describe("createTourLodge", () => {
    it("should create a TourLodge record", async () => {
      travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
      lodgeRepository.getById.mockResolvedValue(mockLodge);
      tourLodgeRepository.create.mockResolvedValue(mockTourLodge);

      const result = await service.createTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id);

      expect(result).toBeInstanceOf(TourLodgeDto);
      expect(result.travelplan_id).toBe(mockTourLodge.travelplan_id);
      expect(result.lodge_id).toBe(mockTourLodge.lodge_id);
    });

    it("should throw if travel plan does not exist", async () => {
      travelPlanRepository.getById.mockResolvedValue(null);

      await expect(
        service.createTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(
        new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND)
      );
    });

    it("should throw if lodge does not exist", async () => {
      travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
      lodgeRepository.getById.mockResolvedValue(null);

      await expect(
        service.createTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(
        new NotFoundException("Lodge not found", ErrorCode.LODGE_NOT_FOUND)
      );
    });
  });

  describe("deleteTourLodge", () => {
    it("should delete a TourLodge record", async () => {
      travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
      lodgeRepository.getById.mockResolvedValue(mockLodge);
      tourLodgeRepository.delete.mockResolvedValue(1);

      const result = await service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id);
      expect(result).toBe(1);
    });

    it("should throw if travel plan does not exist", async () => {
      travelPlanRepository.getById.mockResolvedValue(null);

      await expect(
        service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(
        new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND)
      );
    });

    it("should throw if lodge does not exist", async () => {
      travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
      lodgeRepository.getById.mockResolvedValue(null);

      await expect(
        service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(
        new NotFoundException("Lodge not found", ErrorCode.LODGE_NOT_FOUND)
      );
    });

    it("should throw if no record was deleted", async () => {
      travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
      lodgeRepository.getById.mockResolvedValue(mockLodge);
      tourLodgeRepository.delete.mockResolvedValue(0);

      await expect(
        service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(
        new NotFoundException("Lodge not found in travel plan", ErrorCode.LODGE_NOT_FOUND)
      );
    });
  });

  describe("getLodgesForTravelPlan", () => {
    it("should return LodgeResponseDto[] for a valid travel plan", async () => {
      travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
      tourLodgeRepository.lodgesForTravelPlan.mockResolvedValue([mockLodge]);

      const result = await service.getLodgesForTravelPlan(mockTourLodge.travelplan_id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(LodgeResponseDto);
      expect(result[0].id).toBe(mockLodge.id);
    });

    it("should throw if travel plan does not exist", async () => {
      travelPlanRepository.getById.mockResolvedValue(null);

      await expect(
        service.getLodgesForTravelPlan(mockTourLodge.travelplan_id)
      ).rejects.toThrow(
        new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND)
      );
    });
  });
});
