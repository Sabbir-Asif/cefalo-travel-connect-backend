import { UUID } from "crypto";
import { ITravelPlanRepository } from "../repositories/travel-plan";
import { CreateTravelPlan, TravelPlan, UpdateTravelPlan } from "../interfaces/travel-plan";
import { userService } from "../controllers/user";
import { NotFoundException } from "../exceptions/not-found";
import { ForbiddenException } from "../exceptions/forbidden";
import { ErrorCode } from "../exceptions/root";
import { TravelPlanResponseDto } from "../dtos/travel-plan/travel-plan";
import { Role } from "../interfaces/user";

export class TravelPlanService {
  constructor(private travelPlanRepository: ITravelPlanRepository) {}

  async createTravelPlan(userId: UUID, data: CreateTravelPlan): Promise<TravelPlan> {
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
    }

    const travelPlan = await this.travelPlanRepository.create(userId, data);
    return new TravelPlanResponseDto(travelPlan);
  }

  async getAllTravelPlans(): Promise<TravelPlan[]> {
    const plans = await this.travelPlanRepository.getAll();
    return plans.map(plan => new TravelPlanResponseDto(plan));
  }

  async getTravelPlanById(id: UUID): Promise<TravelPlan> {
    const plan = await this.travelPlanRepository.getById(id);
    if (!plan) {
      throw new NotFoundException(`Travel plan not found with id ${id}`, ErrorCode.TRAVEL_PLAN_NOT_FOUND);
    }

    return new TravelPlanResponseDto(plan);
  }

  async updateTravelPlan(id: UUID, userId: UUID, data: UpdateTravelPlan): Promise<TravelPlan> {
    const plan = await this.travelPlanRepository.getById(id);
    if (!plan) {
      throw new NotFoundException(`Travel plan not found with id ${id}`, ErrorCode.TRAVEL_PLAN_NOT_FOUND);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
    }

    if (user.id !== plan.planner_id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(`User ${userId} cannot update this travel plan`, ErrorCode.FORBIDDEN);
    }

    const updatedPlan = await this.travelPlanRepository.update(id, data);
    
    return new TravelPlanResponseDto(updatedPlan);
  }

  async deleteTravelPlan(id: UUID, userId: UUID): Promise<void> {
    const plan = await this.travelPlanRepository.getById(id);
    if (!plan) {
      throw new NotFoundException(`Travel plan not found with id ${id}`, ErrorCode.TRAVEL_PLAN_NOT_FOUND);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
    }

    if (user.id !== plan.planner_id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(`User ${userId} cannot delete this travel plan`, ErrorCode.FORBIDDEN);
    }

    await this.travelPlanRepository.delete(id);
  }

  async searchTravelPlans(params: Record<string, any>): Promise<TravelPlan[]> {
    const plans = await this.travelPlanRepository.search(params);
    return plans.map(plan => new TravelPlanResponseDto(plan));
  }
}
