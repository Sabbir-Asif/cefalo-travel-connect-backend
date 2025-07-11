import { UUID } from "crypto";
import { z } from "zod";
import { UpdateTravelPlaceSchema } from "../schemas/travel-place";

export interface TravelPlace {
  id: UUID;
  user_id: UUID;
  name: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  cover_image?: string;
  description?: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateTravelPlace {
  name: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  cover_image?: string;
  description?: string;
  tags?: string[];
}

export type UpdateTravelPlace = z.infer<typeof UpdateTravelPlaceSchema>;
