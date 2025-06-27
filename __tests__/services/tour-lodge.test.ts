import { UUID } from "crypto";
import { TourLodgeDto } from "../../src/dtos/tour-lodge";
import { NotFoundException } from "../../src/exceptions/not-found";
import { ErrorCode } from "../../src/exceptions/root";
import { TourLodgeService } from "../../src/services/tour-lodge";
import { LodgeResponseDto } from "../../src/dtos/lodge";

const mockTravelPlan = {
  id: "travelplan-uuid",
  name: "Sylhet Tour",
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
  updated_at: new Date(),
};

const mockTourLodge = {
  travelplan_id: "travelplan-uuid" as UUID,
  lodge_id: "lodge-uuid" as UUID,
};

describe("TourLodgeService", () => {
  const tourLodgeRepository = {
    create: jest.fn(),
    delete: jest.fn(),
    lodgesForTravelPlan: jest.fn(),
  };

  const travelPlanService = {
    getTravelPlanById: jest.fn(),
  };

  const lodgeService = {
    getLodgeById: jest.fn(),
  };

  let service: TourLodgeService;

  beforeEach(() => {
    jest.resetAllMocks();

    jest.mock("../../src/services/travel-plan", () => ({
      travelPlanService,
    }));
    jest.mock("../../src/services/lodge", () => ({
      lodgeService,
    }));

    (global as any).travelPlanService = travelPlanService;
    (global as any).lodgeService = lodgeService;

    service = new TourLodgeService(tourLodgeRepository as any);
  });

  describe("createTourLodge", () => {
    it("should create a TourLodge record", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(mockTravelPlan);
      lodgeService.getLodgeById.mockResolvedValue(mockLodge);
      tourLodgeRepository.create.mockResolvedValue(mockTourLodge);

      const result = await service.createTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id);

      expect(result).toBeInstanceOf(TourLodgeDto);
      expect(result.travelplan_id).toBe(mockTourLodge.travelplan_id);
      expect(result.lodge_id).toBe(mockTourLodge.lodge_id);
    });

    it("should throw if travel plan does not exist", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(null);

      await expect(
        service.createTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND));
    });

    it("should throw if lodge does not exist", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(mockTravelPlan);
      lodgeService.getLodgeById.mockResolvedValue(null);

      await expect(
        service.createTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(new NotFoundException("Lodge not found", ErrorCode.LODGE_NOT_FOUND));
    });
  });

  describe("deleteTourLodge", () => {
    it("should delete a TourLodge record", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(mockTravelPlan);
      lodgeService.getLodgeById.mockResolvedValue(mockLodge);
      tourLodgeRepository.delete.mockResolvedValue(1);

      const result = await service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id);
      expect(result).toBe(1);
    });

    it("should throw if travel plan does not exist", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(null);

      await expect(
        service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND));
    });

    it("should throw if lodge does not exist", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(mockTravelPlan);
      lodgeService.getLodgeById.mockResolvedValue(null);

      await expect(
        service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(new NotFoundException("Lodge not found", ErrorCode.LODGE_NOT_FOUND));
    });

    it("should throw if delete count is 0", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(mockTravelPlan);
      lodgeService.getLodgeById.mockResolvedValue(mockLodge);
      tourLodgeRepository.delete.mockResolvedValue(0);

      await expect(
        service.deleteTourLodge(mockTourLodge.travelplan_id, mockTourLodge.lodge_id)
      ).rejects.toThrow(new NotFoundException("Lodge not found in travel plan", ErrorCode.LODGE_NOT_FOUND));
    });
  });

  describe("getLodgesForTravelPlan", () => {
    it("should return a list of lodges", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(mockTravelPlan);
      tourLodgeRepository.lodgesForTravelPlan.mockResolvedValue([mockLodge]);

      const result = await service.getLodgesForTravelPlan(mockTourLodge.travelplan_id);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(LodgeResponseDto);
    });

    it("should throw if travel plan does not exist", async () => {
      travelPlanService.getTravelPlanById.mockResolvedValue(null);

      await expect(
        service.getLodgesForTravelPlan(mockTourLodge.travelplan_id)
      ).rejects.toThrow(new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND));
    });
  });
});
