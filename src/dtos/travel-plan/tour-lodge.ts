import { UUID } from "crypto";
import { TourLodge } from "../../interfaces/tour-lodge";

export class TourLodgeDto {
  travelplan_id: UUID;
  lodge_id: UUID;

  constructor(data: TourLodge) {
    this.travelplan_id = data.travelplan_id;
    this.lodge_id = data.lodge_id;
  }
}