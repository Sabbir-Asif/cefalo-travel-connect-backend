import { UUID } from "crypto";
import { User } from "../interfaces/user";
import { TravelPlan } from "../interfaces/travel-plan";

export interface ITourMemberRepository {
    create(travelplanId: UUID, userId: UUID): Promise<{ travelplan_id: UUID, user_id: UUID }>;
    delete(travelplanId: UUID, userId: UUID): Promise<number>;
    membersForTravelPlan(travelplanId: UUID): Promise<User[]>;
    travelPlansForMember(userId: UUID): Promise<TravelPlan[]>;
}
