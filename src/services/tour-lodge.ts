import { UUID } from "crypto";
import { ITourLodgeRepository } from "../repositories/tour-lodge";
import { TourLodgeDto } from "../dtos/tour-lodge";
import { LodgeResponseDto } from "../dtos/lodge";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { travelPlanService } from "../controllers/travel-plan";
import { lodgeService } from "../controllers/lodge";

export class TourLodgeService {
    constructor(private tourLodgeRepository: ITourLodgeRepository) { }

    async createTourLodge(travelplanId: UUID, lodgeId: UUID): Promise<TourLodgeDto> {
        const plan = await travelPlanService.getTravelPlanById(travelplanId);
        if (!plan) throw new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND);

        const lodge = await lodgeService.getLodgeById(lodgeId);
        if (!lodge) throw new NotFoundException("Lodge not found", ErrorCode.LODGE_NOT_FOUND);

        const record = await this.tourLodgeRepository.create(travelplanId, lodgeId);
        return new TourLodgeDto(record);
    }

    async deleteTourLodge(travelplanId: UUID, lodgeId: UUID): Promise<number> {
        return await this.tourLodgeRepository.delete(travelplanId, lodgeId);
    }

    async getLodgesForTravelPlan(travelplanId: UUID): Promise<LodgeResponseDto[]> {
        const lodges = await this.tourLodgeRepository.lodgesForTravelPlan(travelplanId);
        return lodges.map(lodge => new LodgeResponseDto(lodge));
    }
}
