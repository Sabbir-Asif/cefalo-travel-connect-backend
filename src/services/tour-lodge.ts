import { UUID } from "crypto";
import { ITourLodgeRepository } from "../repositories/tour-lodge";
import { TourLodgeDto } from "../dtos/tour-lodge";
import { LodgeResponseDto } from "../dtos/lodge";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { ITravelPlanRepository } from "../repositories/travel-plan";
import { ILodgeRepositiry } from '../repositories/lodge';

export class TourLodgeService {
    constructor(
        private tourLodgeRepository: ITourLodgeRepository,
        private travelPlanRepository: ITravelPlanRepository,
        private lodgeRepository: ILodgeRepositiry
    ) { }

    async createTourLodge(travelplanId: UUID, lodgeId: UUID): Promise<TourLodgeDto> {
        const plan = await this.travelPlanRepository.getById(travelplanId);
        if (!plan) throw new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND);

        const lodge = await this.lodgeRepository.getById(lodgeId);
        if (!lodge) throw new NotFoundException("Lodge not found", ErrorCode.LODGE_NOT_FOUND);

        const record = await this.tourLodgeRepository.create(travelplanId, lodgeId);
        return new TourLodgeDto(record);
    }

    async deleteTourLodge(travelplanId: UUID, lodgeId: UUID): Promise<number> {
        const travelPlan = await this.travelPlanRepository.getById(travelplanId);
        if (!travelPlan) {
            throw new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND);
        }
        const lodge = await this.lodgeRepository.getById(lodgeId);
        if (!lodge) {
            throw new NotFoundException("Lodge not found", ErrorCode.LODGE_NOT_FOUND);
        }

        const deletedCount =  await this.tourLodgeRepository.delete(travelplanId, lodgeId);
        if (deletedCount === 0) {
            throw new NotFoundException("Lodge not found in travel plan", ErrorCode.LODGE_NOT_FOUND);
        }

        return deletedCount;
    }

    async getLodgesForTravelPlan(travelplanId: UUID): Promise<LodgeResponseDto[]> {
        const travelPlan = await this.travelPlanRepository.getById(travelplanId);
        if (!travelPlan) {
            throw new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND);
        }
        const lodges = await this.tourLodgeRepository.lodgesForTravelPlan(travelplanId);
        return lodges.map(lodge => new LodgeResponseDto(lodge));
    }
}
