import { UUID } from "crypto";
import { CreateTravelRequest, UpdateTravelRequest, TravelRequest, TravelRequestWithUsers } from "../interfaces/travel-request";

export interface ITravelRequestRepository {
    create(userFrom: UUID, data: CreateTravelRequest): Promise<TravelRequest>;
    getAll(): Promise<TravelRequestWithUsers[]>;
    getById(id: UUID): Promise<TravelRequestWithUsers | null>;
    update(id: UUID, data: UpdateTravelRequest): Promise<TravelRequest>;
    delete(id: UUID): Promise<void>;
    search(params: Record<string, any>): Promise<TravelRequestWithUsers[]>;
}
