import { UUID } from "crypto";

export interface TourLodge {
  travelplan_id: UUID;
  lodge_id: UUID;
}

export interface CreateTourLodge {
  travelplan_id: UUID;
  lodge_id: UUID;
}