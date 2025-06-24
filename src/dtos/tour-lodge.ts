import { UUID } from "crypto";
import { CreateTourLodge, TourLodge } from "../interfaces/tour-lodge";

export class CreateTourLodgeDto {
  travelplan_id: UUID;
  lodge_id: UUID;

  constructor(data: CreateTourLodge) {
    this.travelplan_id = data.travelplan_id;
    this.lodge_id = data.lodge_id;
  }
}

export class TourLodgeDto {
  travelplan_id: UUID;
  lodge_id: UUID;

  constructor(data: TourLodge) {
    this.travelplan_id = data.travelplan_id;
    this.lodge_id = data.lodge_id;
  }
}