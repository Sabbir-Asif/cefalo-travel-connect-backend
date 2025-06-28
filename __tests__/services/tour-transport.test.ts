import { TourTransportService } from "../../src/services/tour-transport";
import { ITourTransportRepository } from "../../src/repositories/tour-transport";
import { UUID } from "crypto";
import { TourTransportWithTransport } from "../../src/interfaces/tour-transport";
import { ErrorCode } from "../../src/exceptions/root";
import { NotFoundException } from "../../src/exceptions/not-found";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { travelPlanService } from "../../src/controllers/travel-plan";
import { TransportType } from "../../src/interfaces/transport";

jest.mock("../../src/controllers/travel-plan", () => ({
  travelPlanService: {
    getTravelPlanById: jest.fn()
  }
}));

const mockRepo: jest.Mocked<ITourTransportRepository> = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn()
};

const mockUserId = "11111111-1111-1111-1111-111111111111" as UUID;
const mockTransportId = "22222222-2222-2222-2222-222222222222" as UUID;
const mockTravelPlanId = "33333333-3333-3333-3333-333333333333" as UUID;
const mockTransportData: TourTransportWithTransport = {
  id: mockTransportId,
  travelplan_id: mockTravelPlanId,
  transport_id: "44444444-4444-4444-4444-444444444444" as UUID,
  departure_time: new Date(),
  contact_number: "01800000000",
  created_at: new Date(),
  updated_at: new Date(),
  transport: {
    id: "44444444-4444-4444-4444-444444444444" as UUID,
    type: TransportType.BUS,
    name: "GreenLine Bus",
    starting_location: "Dhaka",
    starting_point: { lat: 23.8103, long: 90.4125 },
    destination: "Chittagong",
    destination_point: { lat: 22.3569, long: 91.7832 },
    departure_time: new Date(),
    arrival_time: new Date(),
    fare: "500",
    created_at: new Date(),
    updated_at: new Date()
  }
};

describe("TourTransportService", () => {
  const service = new TourTransportService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a tour transport", async () => {
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue({
        id: mockTravelPlanId,
        planner_id: mockUserId
      });

      mockRepo.create.mockResolvedValue(mockTransportData);

      const result = await service.create(mockUserId, {
        travelplan_id: mockTravelPlanId,
        transport_id: mockTransportData.transport_id,
        departure_time: mockTransportData.departure_time,
        contact_number: mockTransportData.contact_number
      });

      expect(result).toHaveProperty("id", mockTransportId);
      expect(result.transport.name).toBe("GreenLine Bus");
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it("should throw if travel plan not found", async () => {
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(mockUserId, {
          travelplan_id: mockTravelPlanId,
          transport_id: mockTransportData.transport_id,
          departure_time: mockTransportData.departure_time,
          contact_number: mockTransportData.contact_number
        })
      ).rejects.toThrow(
        new NotFoundException(`Travel plan not found with id ${mockTravelPlanId}`, ErrorCode.TRAVEL_PLAN_NOT_FOUND)
      );
    });

    it("should throw if user is not planner", async () => {
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue({
        id: mockTravelPlanId,
        planner_id: "another-user-id"
      });

      await expect(
        service.create(mockUserId, {
          travelplan_id: mockTravelPlanId,
          transport_id: mockTransportData.transport_id,
          departure_time: mockTransportData.departure_time,
          contact_number: mockTransportData.contact_number
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getAll", () => {
    it("should return all tour transports", async () => {
      mockRepo.getAll.mockResolvedValue([mockTransportData]);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockTransportId);
    });
  });

  describe("getById", () => {
    it("should return a tour transport", async () => {
      mockRepo.getById.mockResolvedValue(mockTransportData);

      const result = await service.getById(mockTransportId);

      expect(result.id).toBe(mockTransportId);
      expect(result.transport.type).toBe(TransportType.BUS);
    });

    it("should throw if not found", async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.getById(mockTransportId)).rejects.toThrow(
        new NotFoundException(`Tour transport not found with id ${mockTransportId}`, ErrorCode.TOUR_TRANSPORT_NOT_FOUND)
      );
    });
  });

  describe("update", () => {
    it("should update transport", async () => {
      mockRepo.getById.mockResolvedValue(mockTransportData);
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue({
        id: mockTravelPlanId,
        planner_id: mockUserId
      });
      mockRepo.update.mockResolvedValue(mockTransportData);

      const result = await service.update(mockTransportId, mockUserId, {
        contact_number: "01999999999"
      });

      expect(result).toHaveProperty("id", mockTransportId);
      expect(mockRepo.update).toHaveBeenCalled();
    });

    it("should throw if not found", async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.update(mockTransportId, mockUserId, {})).rejects.toThrow(NotFoundException);
    });

    it("should throw if unauthorized", async () => {
      mockRepo.getById.mockResolvedValue(mockTransportData);
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue({
        planner_id: "unauthorized-user-id"
      });

      await expect(service.update(mockTransportId, mockUserId, {})).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("delete", () => {
    it("should delete transport", async () => {
      mockRepo.getById.mockResolvedValue(mockTransportData);
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue({
        planner_id: mockUserId
      });
      mockRepo.delete.mockResolvedValue();

      await expect(service.delete(mockTransportId, mockUserId)).resolves.toBeUndefined();
    });

    it("should throw if not found", async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.delete(mockTransportId, mockUserId)).rejects.toThrow(NotFoundException);
    });

    it("should throw if unauthorized", async () => {
      mockRepo.getById.mockResolvedValue(mockTransportData);
      (travelPlanService.getTravelPlanById as jest.Mock).mockResolvedValue({
        planner_id: "unauthorized-user"
      });

      await expect(service.delete(mockTransportId, mockUserId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("search", () => {
    it("should return matched transports", async () => {
      mockRepo.search.mockResolvedValue([mockTransportData]);

      const result = await service.search({ travelplan_id: mockTravelPlanId });

      expect(result).toHaveLength(1);
      expect(result[0].transport.name).toBe("GreenLine Bus");
    });
  });
});
