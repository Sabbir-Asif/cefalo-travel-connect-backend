import { UUID } from "crypto";
import { TourMember } from "../interfaces/tour-member";

export class TourMemberDto {
    travelplan_id: UUID;
    user_id: UUID;

    constructor(data: TourMember) {
        this.travelplan_id = data.travelplan_id;
        this.user_id = data.user_id;
    }
}
