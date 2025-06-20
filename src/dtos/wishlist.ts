import { UUID } from "crypto";
import { Wishlist, CreateWishlist, UpdateWishlist, WishlistStatus, WishlistWithUser } from "../interfaces/wishlist";
import { UserResponse } from "../interfaces/user";

export class CreateWishlistDto {
  title: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  travel_date: Date;
  tags?: string[];
  note?: string;
  blog_id?: UUID;
  travel_place_id?: UUID;
  cover_image?: string;
  status: WishlistStatus;

  constructor(data: CreateWishlist) {
    this.title = data.title;
    this.location_name = data.location_name;
    this.location_point = {
      lat: data.location_point.lat,
      long: data.location_point.long,
    };
    this.travel_date = new Date(data.travel_date);
    this.tags = data.tags ?? [];
    this.note = data.note;
    this.blog_id = data.blog_id;
    this.travel_place_id = data.travel_place_id;
    this.cover_image = data.cover_image;
    this.status = data.status ?? WishlistStatus.PRIVATE;
  }
}

export class UpdateWishlistDto {
  title?: string;
  location_name?: string;
  location_point?: {
    lat: number;
    long: number;
  };
  travel_date?: Date;
  tags?: string[];
  note?: string;
  blog_id?: UUID | null;
  travel_place_id?: UUID | null;
  cover_image?: string;
  status?: WishlistStatus;

  constructor(data: UpdateWishlist) {
    this.title = data.title;
    this.location_name = data.location_name;

    if (data.location_point) {
      this.location_point = {
        lat: data.location_point.lat,
        long: data.location_point.long,
      };
    }

    this.travel_date = data.travel_date ? new Date(data.travel_date) : undefined;
    this.tags = data.tags;
    this.note = data.note;
    this.blog_id = data.blog_id;
    this.travel_place_id = data.travel_place_id;
    this.cover_image = data.cover_image;
    this.status = data.status;
  }
}

export class WishlistResponseDto {
  id: UUID;
  user_id: UUID;
  title: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  travel_date: Date;
  tags: string[];
  note?: string;
  blog_id?: UUID | null;
  travel_place_id?: UUID | null;
  cover_image?: string;
  status: WishlistStatus;
  created_at: Date;
  updated_at: Date;

  constructor(data: Wishlist) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.location_name = data.location_name;
    this.location_point = {
      lat: data.location_point.lat,
      long: data.location_point.long,
    };
    this.travel_date = new Date(data.travel_date);
    this.tags = data.tags;
    this.note = data.note;
    this.blog_id = data.blog_id;
    this.travel_place_id = data.travel_place_id;
    this.cover_image = data.cover_image;
    this.status = data.status;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
}

export class WishlistWithUserResponseDto {
  id: UUID;
  user_id: UUID;
  user: UserResponse
  title: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  travel_date: Date;
  tags: string[];
  note?: string;
  blog_id?: UUID | null;
  travel_place_id?: UUID | null;
  cover_image?: string;
  status: WishlistStatus;
  created_at: Date;
  updated_at: Date;

  constructor(data: WishlistWithUser) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.user = data.user;
    this.title = data.title;
    this.location_name = data.location_name;
    this.location_point = {
      lat: data.location_point.lat,
      long: data.location_point.long,
    };
    this.travel_date = new Date(data.travel_date);
    this.tags = data.tags;
    this.note = data.note;
    this.blog_id = data.blog_id;
    this.travel_place_id = data.travel_place_id;
    this.cover_image = data.cover_image;
    this.status = data.status;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
}

