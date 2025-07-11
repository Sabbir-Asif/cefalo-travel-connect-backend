import {
    createFood,
    getAllFoods,
    getFoodById,
    updateFood,
    deleteFood,
    searchFoods,
    __setFoodService,
} from "../../src/controllers/food";
import { Request, Response } from "express";
import { FoodService } from "../../src/services/food";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { Food } from "../../src/interfaces/food";

describe("Food Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockFoodService: jest.Mocked<FoodService>;

    const foodId = "6f80fc3e-d0d1-4f7e-bd5d-8412f5c960d0" as UUID;
    const sampleFood: Food = {
        id: foodId,
        name: "Burger",
        category: "Fast Food",
        provider: "Food Court A",
        location: "Dhaka",
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockFoodService = {
            createFood: jest.fn(),
            getAllFoods: jest.fn(),
            getFoodById: jest.fn(),
            updateFood: jest.fn(),
            deleteFood: jest.fn(),
            searchFoods: jest.fn(),
        } as unknown as jest.Mocked<FoodService>;

        __setFoodService(mockFoodService);
        jest.clearAllMocks();
    });

    describe("createFood", () => {
        it("should create food and return 201", async () => {
            req.body = {
                name: "Burger",
                category: "Fast Food",
                provider: "Food Court A",
                location: "Dhaka",
            };
            mockFoodService.createFood.mockResolvedValue(sampleFood);

            await createFood(req as Request, res as Response);

            expect(mockFoodService.createFood).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(sampleFood);
        });

        it("should throw UnprocessableEntityException for invalid input", async () => {
            req.body = { name: 123 };

            await expect(createFood(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
            expect(mockFoodService.createFood).not.toHaveBeenCalled();
        });
    });

    describe("getAllFoods", () => {
        it("should return all foods", async () => {
            mockFoodService.getAllFoods.mockResolvedValue([sampleFood]);

            await getAllFoods(req as Request, res as Response);

            expect(mockFoodService.getAllFoods).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([sampleFood]);
        });
    });

    describe("getFoodById", () => {
        it("should return food by id", async () => {
            req.params = { id: foodId };
            mockFoodService.getFoodById.mockResolvedValue(sampleFood);

            await getFoodById(req as Request, res as Response);

            expect(mockFoodService.getFoodById).toHaveBeenCalledWith(foodId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(sampleFood);
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid" };

            await expect(getFoodById(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("updateFood", () => {
        it("should update food and return 200", async () => {
            req.params = { id: foodId };
            req.body = { name: "Pizza" };
            const updated = { ...sampleFood, name: "Pizza" };
            mockFoodService.updateFood.mockResolvedValue(updated);

            await updateFood(req as Request, res as Response);

            expect(mockFoodService.updateFood).toHaveBeenCalledWith(foodId, expect.objectContaining({ name: "Pizza" }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updated);
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid" };
            req.body = { name: "Pizza" };

            await expect(updateFood(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.params = { id: foodId };
            req.body = { name: 123 };

            await expect(updateFood(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
        });
    });

    describe("deleteFood", () => {
        it("should delete food and return 204", async () => {
            req.params = { id: foodId };

            await deleteFood(req as Request, res as Response);

            expect(mockFoodService.deleteFood).toHaveBeenCalledWith(foodId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw BadRequestException for invalid id", async () => {
            req.params = { id: "invalid" };

            await expect(deleteFood(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("searchFoods", () => {
        it("should return search result", async () => {
            req.query = { category: "Fast Food" };
            mockFoodService.searchFoods.mockResolvedValue([sampleFood]);

            await searchFoods(req as Request, res as Response);

            expect(mockFoodService.searchFoods).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([sampleFood]);
        });
    });
});
