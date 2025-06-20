import { UUID } from "crypto";
import { IWishlistRepository } from "../repositories/wishlist";
import { Wishlist, CreateWishlist, UpdateWishlist } from "../interfaces/wishlist";
import { WishlistResponseDto, WishlistWithUserResponseDto } from "../dtos/wishlist";
import { userService } from "../controllers/user";
import { blogService } from "../controllers/blog";
import { NotFoundException } from "../exceptions/not-found";
import { ForbiddenException } from "../exceptions/forbidden";
import { ErrorCode } from "../exceptions/root";
import { Role } from "../interfaces/user";

export class WishlistService {
    constructor( private wishlistRepository: IWishlistRepository) {};

    async createWishlist(userId: UUID, data: CreateWishlist): Promise<Wishlist> {
        const user = await userService.getUserById(userId);
        if (!user) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        if (data.blog_id) {
            const blog = await blogService.getBlogById(data.blog_id);
            if (!blog) {
                throw new NotFoundException(`Blog not found with id ${data.blog_id}`, ErrorCode.BLOG_NOT_FOUND);
            }
        }

        const wishlist = await this.wishlistRepository.create(userId, data);

        return new WishlistResponseDto(wishlist);
    }

    async getAllWishlists(): Promise<Wishlist[]> {
        const wishlists = await this.wishlistRepository.getAll();

        return wishlists.map(wishlist => new WishlistWithUserResponseDto(wishlist));
    }

    async getWishlistById(id: UUID): Promise<Wishlist> {
        const wishlist = await this.wishlistRepository.getById(id);
        if (!wishlist) {
            throw new NotFoundException(`Wishlist not found with id ${id}`, ErrorCode.WISHLIST_NOT_FOUND);
        }

        return new WishlistWithUserResponseDto(wishlist);
    }

    async updateWishlist(id: UUID, userId: UUID, data: UpdateWishlist): Promise<Wishlist> {
        const wishlist = await this.wishlistRepository.getById(id);
        if (!wishlist) {
            throw new NotFoundException(`Wishlist not found with id ${id}`, ErrorCode.WISHLIST_NOT_FOUND);
        }

        const user = await userService.getUserById(userId);
        if (!user) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        if (user.id !== wishlist.user_id && user.role !== Role.ADMIN) {
            throw new ForbiddenException(`User ${userId} cannot update this wishlist`, ErrorCode.FORBIDDEN);
        }

        if (data.blog_id) {
            const blog = await blogService.getBlogById(data.blog_id);
            if (!blog) {
                throw new NotFoundException(`Blog not found with id ${data.blog_id}`, ErrorCode.BLOG_NOT_FOUND);
            }
        }

        const updatedWishlist = await this.wishlistRepository.update(id, data);
        return new WishlistResponseDto(updatedWishlist);
    }

    async deleteWishlist(id: UUID, userId: UUID): Promise<void> {
        const wishlist = await this.wishlistRepository.getById(id);
        if (!wishlist) {
            throw new NotFoundException(`Wishlist not found with id ${id}`, ErrorCode.WISHLIST_NOT_FOUND);
        }

        const user = await userService.getUserById(userId);
        if (!user) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        if (user.id !== wishlist.user_id && user.role !== Role.ADMIN) {
            throw new ForbiddenException(`User ${userId} cannot delete this wishlist`, ErrorCode.FORBIDDEN);
        }

        await this.wishlistRepository.delete(id);
    }

    async searchWishlists(params: Record<string, any>): Promise<Wishlist[]> {
        const wishlists = await this.wishlistRepository.search(params);

        return wishlists.map(wishlist => new WishlistWithUserResponseDto(wishlist));
    }

    async getWishlistsByUserId(userId: UUID): Promise<Wishlist[]> {
        const user = await userService.getUserById(userId);
        if (!user) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        const wishlists = await this.wishlistRepository.getByUserId(userId);

        return wishlists.map(wishlist => new WishlistResponseDto(wishlist));
    }
}
