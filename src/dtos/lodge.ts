import { UUID } from "crypto";
import { CreateLodge, Lodge, UpdateLodge } from "../interfaces/lodge";

export class CreateLodgeDto {
  name: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  price: number;
  description?: string;
  cover_image?: string;

  constructor(data: CreateLodge) {
    this.name = data.name;
    this.location_name = data.location_name;
    this.location_point = {
      lat: data.location_point.lat,
      long: data.location_point.long,
    };
    this.price = data.price;
    this.description = data.description;
    this.cover_image = data.cover_image;
  }
}

export class UpdateLodgeDto {
  name?: string;
  location_name?: string;
  location_point?: {
    lat: number;
    long: number;
  };
  price?: number;
  description?: string;
  cover_image?: string;

  constructor(data: UpdateLodge) {
    this.name = data.name;
    this.location_name = data.location_name;

    if (data.location_point) {
      this.location_point = {
        lat: data.location_point.lat,
        long: data.location_point.long,
      };
    }

    this.price = data.price;
    this.description = data.description;
    this.cover_image = data.cover_image;
  }
}

export class LodgeResponseDto {
  id: UUID;
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

  constructor(data: Lodge) {
    this.id = data.id;
    this.name = data.name;
    this.location_name = data.location_name;
    this.location_point = {
      lat: data.location_point.lat,
      long: data.location_point.long,
    };
    this.price = data.price;
    this.description = data.description;
    this.cover_image = data.cover_image;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}