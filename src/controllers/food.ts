import { Request, Response } from "express";
import { FoodRepository } from "../infrastructure/food-impl";
import { FoodService } from "../services/food";
import { CreateFoodSchema, UpdateFoodSchema } from "../schemas/food";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { IdSchema } from "../schemas/id";
import { BadRequestException } from "../exceptions/bad-request";
import { CreateFoodDto, UpdateFoodDto } from "../dtos/food";
import { CreateFood, Food, UpdateFood } from "../interfaces/food";
import { UUID } from "crypto";

const foodRepository = new FoodRepository();
export const foodService = new FoodService(foodRepository);

export const createFood = async (req: Request, res: Response) => {
  const parsed = CreateFoodSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const foodCreateDto: CreateFood = new CreateFoodDto(parsed.data);
  const food: Food = await foodService.createFood(foodCreateDto);

  res.status(201).json(food);
};

export const getAllFoods = async (req: Request, res: Response) => {
  const foods: Food[] = await foodService.getAllFoods();
  res.status(200).json(foods);
};

export const getFoodById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid food id", ErrorCode.INVALID_FOOD_ID);
  }

  const foodId = parsedId.data as UUID;

  const food = await foodService.getFoodById(foodId);

  res.status(200).json(food);
};

export const updateFood = async (req: Request, res: Response) => {
  
const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid food id", ErrorCode.INVALID_FOOD_ID);
  }

  const foodId = parsedId.data as UUID;

  const parsed = UpdateFoodSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const updateFoodDto: UpdateFood = new UpdateFoodDto(parsed.data);
  const updatedFood = await foodService.updateFood(foodId, updateFoodDto);

  res.status(200).json(updatedFood);
};

export const deleteFood = async (req: Request, res: Response) => {
  const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid food id", ErrorCode.INVALID_FOOD_ID);
  }

  const foodId = parsedId.data as UUID;

  await foodService.deleteFood(foodId);
  
  res.status(204).json({ success: true });
};

export const searchFoods = async (req: Request, res: Response) => {
  const queryParams = req.query;
  const foods = await foodService.searchFoods(queryParams);
  res.status(200).json(foods);
};
