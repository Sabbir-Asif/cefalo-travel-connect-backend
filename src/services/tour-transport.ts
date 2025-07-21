import { UUID } from "crypto";
import { CreateTourTransport, UpdateTourTransport } from "../interfaces/tour-transport";
import { ITourTransportRepository } from "../repositories/tour-transport";
import { TourTransportWithTransportDto } from "../dtos/travel-plan/tour-transport";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { travelPlanService } from "../controllers/travel-plan";
import { UnauthorizedException } from "../exceptions/unauthorized";

export class TourTransportService {
  constructor(private tourTransportRepository: ITourTransportRepository) {}

  async create(userId: UUID, data: CreateTourTransport): Promise<TourTransportWithTransportDto> {
    const { travelplan_id } = data;
    const travelPlan = await travelPlanService.getTravelPlanById(travelplan_id);
    if (!travelPlan) {
      throw new NotFoundException(`Travel plan not found with id ${travelplan_id}`, ErrorCode.TRAVEL_PLAN_NOT_FOUND);
    }

    if (travelPlan.planner_id !== userId) {
      throw new UnauthorizedException(`Unauthorized to create transport for this travel plan`, ErrorCode.UNAUTHORIZED);
    }

    const transport = await this.tourTransportRepository.create(data);

    return new TourTransportWithTransportDto(transport);
  }

  async getAll(): Promise<TourTransportWithTransportDto[]> {
    const transports = await this.tourTransportRepository.getAll();

    return transports.map(transport => new TourTransportWithTransportDto(transport));
  }

  async getById(id: UUID): Promise<TourTransportWithTransportDto> {
    const transport = await this.tourTransportRepository.getById(id);
    if (!transport) {
      throw new NotFoundException(`Tour transport not found with id ${id}`, ErrorCode.TOUR_TRANSPORT_NOT_FOUND);
    }

    return new TourTransportWithTransportDto(transport);
  }

  async update(id: UUID, userId: UUID, data: UpdateTourTransport): Promise<TourTransportWithTransportDto> {
    const existingTourTransport = await this.tourTransportRepository.getById(id);
    if (!existingTourTransport) {
      throw new NotFoundException(`Tour transport not found with id ${id}`, ErrorCode.TOUR_TRANSPORT_NOT_FOUND);
    }

    const travelPlanId = existingTourTransport.travelplan_id;
    const travelPlan = await travelPlanService.getTravelPlanById(travelPlanId);
    if(travelPlan.planner_id !== userId) {
        throw new UnauthorizedException(`Unauthorized to update this tour transport`, ErrorCode.UNAUTHORIZED);
    }

    const updated = await this.tourTransportRepository.update(id, data);
    return new TourTransportWithTransportDto(updated);
  }

  async delete(id: UUID, userId: UUID): Promise<void> {
    const existingTourTransport = await this.tourTransportRepository.getById(id);
    if (!existingTourTransport) {
      throw new NotFoundException(`Tour transport not found with id ${id}`, ErrorCode.TOUR_TRANSPORT_NOT_FOUND);
    }

    const travelPlanId = existingTourTransport.travelplan_id;
    const travelPlan = await travelPlanService.getTravelPlanById(travelPlanId);
    if(travelPlan.planner_id !== userId) {
        throw new UnauthorizedException(`Unauthorized to update this tour transport`, ErrorCode.UNAUTHORIZED);
    }


    await this.tourTransportRepository.delete(id);
  }

  async search(params: Record<string, any>): Promise<TourTransportWithTransportDto[]> {
    const results = await this.tourTransportRepository.search(params);
    return results.map(r => new TourTransportWithTransportDto(r));
  }
}
