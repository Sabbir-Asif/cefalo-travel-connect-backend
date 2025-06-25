import { UUID } from "crypto";
import { CreateFood, Food, UpdateFood } from "../interfaces/food";

export interface IFoodRepository {
  create(food: CreateFood): Promise<Food>;
  getAll(): Promise<Food[]>;
  getById(id: UUID): Promise<Food | null>;
  update(id: UUID, data: UpdateFood): Promise<Food>;
  delete(id: UUID): Promise<void>;
 search(params: Record<string, any>): Promise<Food[]>;
}
