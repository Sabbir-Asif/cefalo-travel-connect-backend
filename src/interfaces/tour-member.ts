import { UUID } from "crypto";

export interface TourMember {
    travelplan_id: UUID;
    user_id: UUID;
}

export interface CreateTourMember {
    travelplan_id: UUID;
    user_id: UUID;
}
