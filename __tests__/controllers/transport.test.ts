import {
    getTransportById,
    getAllTransports,
    createTransport,
    updateTransport,
    deleteTransport,
    getAllStartingLocations,
    getAllDestinationLocations,
    searchTransports,
    __setTransportService,
  } from "../../src/controllers/transport";
  import { TransportService } from "../../src/services/transport";
  import { Request, Response } from "express";
  import { UUID } from "crypto";
  import { UnprocessableEntityException } from "../../src/exceptions/validation";
  import { BadRequestException } from "../../src/exceptions/bad-request";
import { TransportType } from "../../src/interfaces/transport";
  
  describe("TransportController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTransportService: jest.Mocked<TransportService>;
  
    const transportId = "123e4567-e89b-12d3-a456-426614174000" as UUID;
  
    const fullMockTransport = {
      id: transportId,
      type: TransportType.BUS,
      name: "Bus 101",
      starting_location: "City A",
      starting_point: { lat: 12.34, long: 56.78 },
      destination: "City B",
      destination_point: { lat: 23.45, long: 67.89 },
      departure_time: new Date(),
      arrival_time: new Date(),
      fare: "100",
      created_at: new Date(),
      updated_at: new Date(),
    };
  
    beforeEach(() => {
      req = {
        body: {},
        params: {},
        query: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      mockTransportService = {
        getTransportById: jest.fn(),
        getAllTransports: jest.fn(),
        createTransport: jest.fn(),
        updateTransport: jest.fn(),
        deleteTransport: jest.fn(),
        getAllStartingLocations: jest.fn(),
        getAllDestinationLocations: jest.fn(),
        searchTransports: jest.fn(),
      } as unknown as jest.Mocked<TransportService>;
  
      __setTransportService(mockTransportService);
      jest.clearAllMocks();
    });
  
    describe("getTransportById", () => {
      it("should return transport by id", async () => {
        req.params = { id: transportId };
        mockTransportService.getTransportById.mockResolvedValue(fullMockTransport);
  
        await getTransportById(req as Request, res as Response);
  
        expect(mockTransportService.getTransportById).toHaveBeenCalledWith(transportId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fullMockTransport);
      });
  
      it("should throw BadRequestException if id invalid", async () => {
        req.params = { id: "invalid-uuid" };
  
        await expect(getTransportById(req as Request, res as Response))
          .rejects.toThrow(BadRequestException);
      });
    });
  
    describe("getAllTransports", () => {
      it("should return all transports", async () => {
        mockTransportService.getAllTransports.mockResolvedValue([fullMockTransport]);
  
        await getAllTransports(req as Request, res as Response);
  
        expect(mockTransportService.getAllTransports).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([fullMockTransport]);
      });
    });
  
    describe("createTransport", () => {
      it("should create transport and return 201", async () => {
        req.body = {
          type: "BUS",
          name: "Bus 101",
          starting_location: "City A",
          starting_point: { lat: 12.34, long: 56.78 },
          destination: "City B",
          destination_point: { lat: 23.45, long: 67.89 },
          departure_time: "2025-06-28T10:00:00.000Z",
          arrival_time: "2025-06-28T15:00:00.000Z",
          fare: "100",
        };
  
        mockTransportService.createTransport.mockResolvedValue(fullMockTransport);
  
        await createTransport(req as Request, res as Response);
  
        expect(mockTransportService.createTransport).toHaveBeenCalledWith(expect.objectContaining(req.body));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fullMockTransport);
      });
  
      it("should throw UnprocessableEntityException for invalid body", async () => {
        req.body = { invalid: "data" };
  
        await expect(createTransport(req as Request, res as Response))
          .rejects.toThrow(UnprocessableEntityException);
      });
    });
  
    describe("updateTransport", () => {
      it("should update and return updated transport", async () => {
        req.params = { id: transportId };
        req.body = { name: "Updated Bus" };
  
        mockTransportService.updateTransport.mockResolvedValue({ ...fullMockTransport, name: "Updated Bus" });
  
        await updateTransport(req as Request, res as Response);
  
        expect(mockTransportService.updateTransport).toHaveBeenCalledWith(transportId, expect.objectContaining(req.body));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated Bus" }));
      });
  
      it("should throw BadRequestException if id invalid", async () => {
        req.params = { id: "invalid-uuid" };
        req.body = { name: "Updated Bus" };
  
        await expect(updateTransport(req as Request, res as Response))
          .rejects.toThrow(BadRequestException);
      });
  
      it("should throw UnprocessableEntityException if body invalid", async () => {
        req.params = { id: transportId };
        req.body = { fare: 123 }; // invalid type
  
        await expect(updateTransport(req as Request, res as Response))
          .rejects.toThrow(UnprocessableEntityException);
      });
    });
  
    describe("deleteTransport", () => {
      it("should delete transport and return 204", async () => {
        req.params = { id: transportId };
        mockTransportService.deleteTransport.mockResolvedValue(1);
  
        await deleteTransport(req as Request, res as Response);
  
        expect(mockTransportService.deleteTransport).toHaveBeenCalledWith(transportId);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith(1);
      });
  
      it("should throw BadRequestException if id invalid", async () => {
        req.params = { id: "invalid-uuid" };
  
        await expect(deleteTransport(req as Request, res as Response))
          .rejects.toThrow(BadRequestException);
      });
    });
  
    describe("getAllStartingLocations", () => {
      it("should return all starting locations", async () => {
        const locations = [
          { name: "City A", location_point: { lat: 12.34, long: 56.78 } },
        ];
        mockTransportService.getAllStartingLocations.mockResolvedValue(locations);
  
        await getAllStartingLocations(req as Request, res as Response);
  
        expect(mockTransportService.getAllStartingLocations).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(locations);
      });
    });
  
    describe("getAllDestinationLocations", () => {
      it("should return all destination locations", async () => {
        const locations = [
          { name: "City B", location_point: { lat: 23.45, long: 67.89 } },
        ];
        mockTransportService.getAllDestinationLocations.mockResolvedValue(locations);
  
        await getAllDestinationLocations(req as Request, res as Response);
  
        expect(mockTransportService.getAllDestinationLocations).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(locations);
      });
    });
  
    describe("searchTransports", () => {
      it("should return search results", async () => {
        req.query = { name: "Bus" };
        mockTransportService.searchTransports.mockResolvedValue([fullMockTransport]);
  
        await searchTransports(req as Request, res as Response);
  
        expect(mockTransportService.searchTransports).toHaveBeenCalledWith(req.query);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([fullMockTransport]);
      });
    });
  });
  