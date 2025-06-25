import { UUID } from "crypto";
import { ITravelRequestRepository } from "../repositories/travel-request";
import { CreateTravelRequest, TravelRequest, UpdateTravelRequest } from "../interfaces/travel-request";
import { userService } from "../controllers/user";
import { travelPlanService } from "../controllers/travel-plan";
import { NotFoundException } from "../exceptions/not-found";
import { ForbiddenException } from "../exceptions/forbidden";
import { ErrorCode } from "../exceptions/root";
import { TravelRequestResponseDto, TravelRequestWithUsersResponseDto } from "../dtos/travel-request";
import { Role } from "../interfaces/user";

export class TravelRequestService {
  constructor(private travelRequestRepository: ITravelRequestRepository) {}

  async createTravelRequest(userFrom: UUID, data: CreateTravelRequest): Promise<TravelRequest> {
    const fromUser = await userService.getUserById(userFrom);
    if (!fromUser) {
      throw new NotFoundException(`User not found with id ${userFrom}`, ErrorCode.USER_NOTFOUND);
    }

    const toUser = await userService.getUserById(data.user_to);
    if (!toUser) {
      throw new NotFoundException(`Recipient user not found with id ${data.user_to}`, ErrorCode.USER_NOTFOUND);
    }

    const travelPlan = await travelPlanService.getTravelPlanById(data.travel_plan_id);
    if (!travelPlan) {
      throw new NotFoundException(`Travel plan not found with id ${data.travel_plan_id}`, ErrorCode.TRAVEL_PLAN_NOT_FOUND);
    }

    const newRequest = await this.travelRequestRepository.create(userFrom, data);
    return new TravelRequestResponseDto(newRequest);
  }

  async getAllTravelRequests(): Promise<TravelRequest[]> {
    const requests = await this.travelRequestRepository.getAll();
    return requests.map(request => new TravelRequestWithUsersResponseDto(request));
  }

  async getTravelRequestById(id: UUID): Promise<TravelRequest> {
    const request = await this.travelRequestRepository.getById(id);
    if (!request) {
      throw new NotFoundException(`Travel request not found with id ${id}`, ErrorCode.TRAVEL_REQUEST_NOT_FOUND);
    }

    return new TravelRequestWithUsersResponseDto(request);
  }

  async updateTravelRequest(id: UUID, userId: UUID, data: UpdateTravelRequest): Promise<TravelRequest> {
    const request = await this.travelRequestRepository.getById(id);
    if (!request) {
      throw new NotFoundException(`Travel request not found with id ${id}`, ErrorCode.TRAVEL_REQUEST_NOT_FOUND);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
    }

    if (request.user_to !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(`User ${userId} is not authorized to update this request`, ErrorCode.FORBIDDEN);
    }

    const updated = await this.travelRequestRepository.update(id, data);
    return new TravelRequestResponseDto(updated);
  }

  async deleteTravelRequest(id: UUID, userId: UUID): Promise<void> {
    const request = await this.travelRequestRepository.getById(id);
    if (!request) {
      throw new NotFoundException(`Travel request not found with id ${id}`, ErrorCode.TRAVEL_REQUEST_NOT_FOUND);
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
    }

    if (request.user_from !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(`User ${userId} is not authorized to delete this request`, ErrorCode.FORBIDDEN);
    }

    await this.travelRequestRepository.delete(id);
  }

  async searchTravelRequests(params: Record<string, any>): Promise<TravelRequest[]> {
    const requests = await this.travelRequestRepository.search(params);
    return requests.map(request => new TravelRequestWithUsersResponseDto(request));
  }
}
