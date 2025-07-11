import { FoodService } from "../../src/services/food";
import { IFoodRepository } from "../../src/repositories/food";
import { FoodResponseDto } from "../../src/dtos/food";
import { NotFoundException } from "../../src/exceptions/not-found";
import { ErrorCode } from "../../src/exceptions/root";
import { UUID } from "crypto";
import { CreateFood, Food, UpdateFood } from "../../src/interfaces/food";

describe("FoodService", () => {
  let mockRepo: jest.Mocked<IFoodRepository>;
  let service: FoodService;

  const id = "11111111-1111-1111-1111-111111111111" as UUID;

  const sampleFood: Food = {
    id,
    name: "Pizza",
    category: "Fast Food",
    provider: "Pizza Hut",
    location: "New York",
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };

    service = new FoodService(mockRepo);
  });

  describe("createFood", () => {
    it("should create a food and return FoodResponseDto", async () => {
      mockRepo.create.mockResolvedValue(sampleFood);

      const result = await service.createFood({
        name: sampleFood.name,
        category: sampleFood.category,
        provider: sampleFood.provider,
        location: sampleFood.location,
      });

      expect(mockRepo.create).toHaveBeenCalledWith({
        name: sampleFood.name,
        category: sampleFood.category,
        provider: sampleFood.provider,
        location: sampleFood.location,
      });
      expect(result).toBeInstanceOf(FoodResponseDto);
      expect(result.id).toBe(sampleFood.id);
    });
  });

  describe("getAllFoods", () => {
    it("should return array of FoodResponseDto", async () => {
      mockRepo.getAll.mockResolvedValue([sampleFood]);

      const result = await service.getAllFoods();

      expect(mockRepo.getAll).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(FoodResponseDto);
      expect(result[0].id).toBe(sampleFood.id);
    });
  });

  describe("getFoodById", () => {
    it("should return FoodResponseDto if found", async () => {
      mockRepo.getById.mockResolvedValue(sampleFood);

      const result = await service.getFoodById(id);

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(FoodResponseDto);
      expect(result.id).toBe(sampleFood.id);
    });

    it("should throw NotFoundException if food not found", async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.getFoodById(id)).rejects.toThrow(NotFoundException);
      await expect(service.getFoodById(id)).rejects.toMatchObject({
        errorCode: ErrorCode.FOOD_NOT_FOUND,
      });
    });
  });

  describe("updateFood", () => {
    const updateData: UpdateFood = {
      name: "Updated Pizza",
      category: "Updated Category",
      provider: "Updated Provider",
      location: "Updated Location",
    };

    it("should update and return updated FoodResponseDto if food exists", async () => {
      mockRepo.getById.mockResolvedValue(sampleFood);
      mockRepo.update.mockResolvedValue({ ...sampleFood, ...updateData });

      const result = await service.updateFood(id, updateData);

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toBeInstanceOf(FoodResponseDto);
      expect(result.name).toBe(updateData.name);
    });

    it("should throw NotFoundException if food not found", async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.updateFood(id, updateData)).rejects.toThrow(NotFoundException);
      await expect(service.updateFood(id, updateData)).rejects.toMatchObject({
        errorCode: ErrorCode.FOOD_NOT_FOUND,
      });
    });
  });

  describe("deleteFood", () => {
    it("should call delete if food exists", async () => {
      mockRepo.getById.mockResolvedValue(sampleFood);
      mockRepo.delete.mockResolvedValue();

      await service.deleteFood(id);

      expect(mockRepo.getById).toHaveBeenCalledWith(id);
      expect(mockRepo.delete).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException if food not found", async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(service.deleteFood(id)).rejects.toThrow(NotFoundException);
      await expect(service.deleteFood(id)).rejects.toMatchObject({
        errorCode: ErrorCode.FOOD_NOT_FOUND,
      });
    });
  });

  describe("searchFoods", () => {
    it("should return array of FoodResponseDto matching params", async () => {
      mockRepo.search.mockResolvedValue([sampleFood]);

      const result = await service.searchFoods({ name: "Pizza" });

      expect(mockRepo.search).toHaveBeenCalledWith({ name: "Pizza" });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(FoodResponseDto);
    });
  });
});
