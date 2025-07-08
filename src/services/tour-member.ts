import { UUID } from "crypto";
import { ITourMemberRepository } from "../repositories/tour-member";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { UserResponseDto } from "../dtos/user";
import { User } from "../interfaces/user";
import { ITravelPlanRepository } from "../repositories/travel-plan";
import { IUserRepository } from "../repositories/user";
import { TravelPlan } from "../interfaces/travel-plan";
import { TravelPlanResponseDto } from "../dtos/travel-plan";

export class TourMemberService {
    constructor(
        private tourMemberRepository: ITourMemberRepository,
        private travelPlanRepository: ITravelPlanRepository,
        private userrepository: IUserRepository
    ) { }

    async createTourMember(travelplanId: UUID, userId: UUID): Promise<{ travelplan_id: UUID, user_id: UUID }> {
        const travelPlan = await this.travelPlanRepository.getById(travelplanId);
        if (!travelPlan) {
            throw new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND);
        }

        const user = await this.userrepository.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found", ErrorCode.USER_NOTFOUND);
        }

        return await this.tourMemberRepository.create(travelplanId, userId);
    }

    async deleteTourMember(travelplanId: UUID, userId: UUID): Promise<number> {
        const travelPlan = await this.travelPlanRepository.getById(travelplanId);
        if (!travelPlan) {
            throw new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND);
        }
        const user = await this.userrepository.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found", ErrorCode.USER_NOTFOUND);
        }

        const deletedNumber = await this.tourMemberRepository.delete(travelplanId, userId);
        if (deletedNumber === 0) {
            throw new NotFoundException("Member not found in travel plan", ErrorCode.USER_NOTFOUND);
        }

        return deletedNumber;
    }

    async getMembersForTravelPlan(travelplanId: UUID): Promise<UserResponseDto[]> {
        const travelPlan = await this.travelPlanRepository.getById(travelplanId);
        if (!travelPlan) {
            throw new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND);
        }
        const users: User[] = await this.tourMemberRepository.membersForTravelPlan(travelplanId);
        return users.map(user => new UserResponseDto(user));
    }

    async getTravelPlansForMember(userId: UUID): Promise<TravelPlan[]> {
        const user = await this.userrepository.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found", ErrorCode.USER_NOTFOUND);
        }

        const travelPlans: TravelPlan[] = await this.tourMemberRepository.travelPlansForMember(userId);
        return travelPlans.map(travelPlan => new TravelPlanResponseDto(travelPlan));
    }
}
