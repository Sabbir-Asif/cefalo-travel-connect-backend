import { UUID } from "crypto";
import { CreateLodge, Lodge, LodgeLocation, UpdateLodge } from "../interfaces/lodge";

export interface ILodgeRepositiry {
    create(lodge: CreateLodge) : Promise<Lodge>;
    getAll() : Promise<Lodge[]>;
    getById(id: UUID) : Promise<Lodge | null>;
    update(id: UUID, data: UpdateLodge) : Promise<Lodge>;
    delete(id: UUID) : Promise<void>;
    // allLocations() : Promise<LodgeLocation[]>;
}