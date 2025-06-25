import { UUID } from "crypto";
import { IFoodRepository } from "../repositories/food";
import { CreateFood, Food, UpdateFood } from "../interfaces/food";
import { FoodResponseDto } from "../dtos/food";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export class FoodService {
  constructor(private foodRepository: IFoodRepository) {}

  async createFood(data: CreateFood): Promise<Food> {
    const food = await this.foodRepository.create(data);
    
    return new FoodResponseDto(food);
  }

  async getAllFoods(): Promise<Food[]> {
    const foods = await this.foodRepository.getAll();
    
    return foods.map((food) => new FoodResponseDto(food));
  }

  async getFoodById(id: UUID): Promise<FoodResponseDto> {
    const food = await this.foodRepository.getById(id);
    if (!food) {
      throw new NotFoundException(`Food not found with id ${id}`, ErrorCode.FOOD_NOT_FOUND);
    }
    
    return new FoodResponseDto(food);
  }

  async updateFood(id: UUID, data: UpdateFood): Promise<FoodResponseDto> {
    const food = await this.foodRepository.getById(id);
    if (!food) {
      throw new NotFoundException(`Food not found with id ${id}`, ErrorCode.FOOD_NOT_FOUND);
    }

    const updatedFood = await this.foodRepository.update(id, data);
    
    return new FoodResponseDto(updatedFood);
  }

  async deleteFood(id: UUID): Promise<void> {
    const food = await this.foodRepository.getById(id);
    if (!food) {
      throw new NotFoundException(`Food not found with id ${id}`, ErrorCode.FOOD_NOT_FOUND);
    }

    await this.foodRepository.delete(id);
  }

  async searchFoods(params: Record<string, any>): Promise<FoodResponseDto[]> {
    const foods = await this.foodRepository.search(params);
    return foods.map((food) => new FoodResponseDto(food));
  }
}
