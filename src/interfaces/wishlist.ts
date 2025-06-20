import { UUID } from "crypto";

export enum WishlistStatus {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface Wishlist {
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
}

export interface CreateWishlist {
  title: string;
  location_name: string;
  location_point: {
    lat: number;
    long: number;
  };
  travel_date: Date | string;
  tags?: string[];
  note?: string;
  blog_id?: UUID;
  travel_place_id?: UUID;
  cover_image?: string;
  status?: WishlistStatus;
}

export interface UpdateWishlist {
  title?: string;
  location_name?: string;
  location_point?: {
    lat: number;
    long: number;
  };
  travel_date?: Date | string;
  tags?: string[];
  note?: string;
  blog_id?: UUID | null;
  travel_place_id?: UUID | null;
  cover_image?: string;
  status?: WishlistStatus;
}
