import { UUID } from "crypto";
import { CreateTravelPlace, TravelPlace, UpdateTravelPlace } from "../interfaces/travel-place";

export class CreateTravelPlaceDto {
  name: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  cover_image?: string;
  description?: string;
  tags?: string[];

  constructor(data: CreateTravelPlace) {
    this.name = data.name;
    this.location_name = data.location_name;
    this.location_point = {
      lat: data.location_point.lat,
      long: data.location_point.long,
    };
    this.cover_image = data.cover_image;
    this.description = data.description;
    this.tags = data.tags;
  }
}

export class UpdateTravelPlaceDto {
  name?: string;
  location_name?: string;
  location_point?: {
    lat: number;
    long: number;
  };
  cover_image?: string;
  description?: string;
  tags?: string[];

  constructor(data: UpdateTravelPlace) {
    this.name = data.name;
    this.location_name = data.location_name;

    if (data.location_point) {
      this.location_point = {
        lat: data.location_point.lat,
        long: data.location_point.long,
      };
    }

    this.cover_image = data.cover_image;
    this.description = data.description;
    this.tags = data.tags;
  }
}

export class TravelPlaceResponseDto {
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

  constructor(data: TravelPlace) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.location_name = data.location_name;
    this.location_point = {
      lat: data.location_point.lat,
      long: data.location_point.long,
    };
    this.cover_image = data.cover_image;
    this.description = data.description;
    this.tags = data.tags;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
