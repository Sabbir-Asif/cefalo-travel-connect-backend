import { UUID } from "crypto";
import { z } from "zod";
import { UpdateLodgeSchema } from "../schemas/lodge";

export interface Lodge {
  id: UUID
  name: string;
  locationName: string;
  locationPoint: {
    lat: number;
    long: number;
  };
  price: number;
  description?: string;
  coverImage?: string;
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
  coverImage?: string;
}

export type UpdateLodge = z.infer<typeof UpdateLodgeSchema>