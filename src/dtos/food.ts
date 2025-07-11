import { UUID } from "crypto";
import { CreateFood, Food, UpdateFood } from "../interfaces/food";

export class CreateFoodDto {
  name: string;
  category: string;
  provider: string;
  location: string;

  constructor(data: CreateFood) {
    this.name = data.name;
    this.category = data.category;
    this.provider = data.provider;
    this.location = data.location;
  }
}

export class UpdateFoodDto {
  name?: string;
  category?: string;
  provider?: string;
  location?: string;

  constructor(data: UpdateFood) {
    this.name = data.name;
    this.category = data.category;
    this.provider = data.provider;
    this.location = data.location;
  }
}

export class FoodResponseDto {
  id: UUID;
  name: string;
  category: string;
  provider: string;
  location: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: Food) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.provider = data.provider;
    this.location = data.location;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
