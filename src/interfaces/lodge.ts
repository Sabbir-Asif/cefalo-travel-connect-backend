import { UUID } from "crypto";
import { z } from "zod";
import { UpdateLodgeSchema } from "../schemas/lodge";

export interface Lodge {
    id: UUID
    name: string;
    location_name: string;
    location_point: {
        lat: number;
        long: number;
    };
    price: number;
    description?: string;
    cover_image?: string;
    created_at: Date;
    updated_at: Date;
}


export interface CreateLodge {
    name: string;
    location_name: string;
    location_point: {
        lat: number;
        long: number;
    };
    price: number;
    description?: string;
    cover_image?: string;
}

export type UpdateLodge = z.infer<typeof UpdateLodgeSchema>

export interface LodgeLocation {
    name: string,
    location_point: {
        lat: number;
        long: number;
    };
}