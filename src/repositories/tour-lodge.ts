import { UUID } from "crypto";
import { TourLodge } from "../interfaces/tour-lodge";
import { Lodge } from "../interfaces/lodge";

export interface ITourLodgeRepository {
  create(travelplanId: UUID, lodgeId: UUID): Promise<TourLodge>;
  delete(travelplanId: UUID, lodgeId: UUID): Promise<number>;
  lodgesForTravelPlan(travelplanId: UUID): Promise<Lodge[]>;
}
