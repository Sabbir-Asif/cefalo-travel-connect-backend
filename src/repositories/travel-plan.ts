import { UUID } from "crypto";
import { TravelPlan, CreateTravelPlan, UpdateTravelPlan } from "../interfaces/travel-plan";

export interface ITravelPlanRepository {
  create(userId: UUID, data: CreateTravelPlan): Promise<TravelPlan>;
  getAll(): Promise<TravelPlan[]>;
  getById(id: UUID): Promise<TravelPlan | null>;
  update(id: UUID, data: UpdateTravelPlan): Promise<TravelPlan>;
  delete(id: UUID): Promise<void>;
  search(params: Record<string, any>): Promise<TravelPlan[]>;
}
