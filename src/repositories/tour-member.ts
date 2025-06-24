import { UUID } from "crypto";
import { User, UserResponse } from "../interfaces/user";

export interface ITourMemberRepository {
    create(travelplanId: UUID, userId: UUID): Promise<{ travelplan_id: UUID, user_id: UUID }>;
    delete(travelplanId: UUID, userId: UUID): Promise<number>;
    membersForTravelPlan(travelplanId: UUID): Promise<User[]>;
}
