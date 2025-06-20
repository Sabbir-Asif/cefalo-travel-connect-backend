import { UUID } from "crypto";
import { Wishlist, CreateWishlist, UpdateWishlist, WishlistWithUser } from "../interfaces/wishlist";

export interface IWishlistRepository {
  create(userId: UUID, data: CreateWishlist): Promise<Wishlist>;
  getAll(): Promise<WishlistWithUser[]>;
  getById(id: UUID): Promise<WishlistWithUser | null>;
  getByUserId(userId: UUID): Promise<Wishlist[]>;
  update(id: UUID, data: UpdateWishlist): Promise<Wishlist>;
  delete(id: UUID): Promise<void>;
  search(params: Record<string, any>): Promise<WishlistWithUser[]>;
}
