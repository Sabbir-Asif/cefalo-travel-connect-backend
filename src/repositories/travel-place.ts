import { UUID } from "crypto";
import { CreateTravelPlace, TravelPlace, UpdateTravelPlace } from "../interfaces/travel-place";

export interface ITravelPlaceRepository {
    create(userId: UUID, travelPlace: CreateTravelPlace) : Promise<TravelPlace>;
    getAll() : Promise<TravelPlace[]>;
    getById(id: UUID) : Promise<TravelPlace | null>;
    update(id: UUID, data: UpdateTravelPlace) : Promise<TravelPlace>;
    delete(id: UUID) : Promise<void>;
    search(params: Record<string, any>): Promise<TravelPlace[]>;
}