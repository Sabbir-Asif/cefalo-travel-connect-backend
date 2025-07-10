import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../middlewares/error-handler";
import { createWishlist, deleteWishlist, getAllWishlists, getMatchingUsers, getWishlistById, searchWishlists, updateWishlist } from "../controllers/wishlist";

export const wishlistRouter : Router = Router();

wishlistRouter.post('/', authMiddleware, errorHandler(createWishlist));
wishlistRouter.get('/search', authMiddleware, errorHandler(searchWishlists));
wishlistRouter.get('/matchmaking', authMiddleware, errorHandler(getMatchingUsers));
wishlistRouter.get('/:id', authMiddleware, errorHandler(getWishlistById));
wishlistRouter.get('/', authMiddleware, errorHandler(getAllWishlists));
wishlistRouter.put('/:id', authMiddleware, errorHandler(updateWishlist));
wishlistRouter.delete('/:id', authMiddleware, errorHandler(deleteWishlist));
