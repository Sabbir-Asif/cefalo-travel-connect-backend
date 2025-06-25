import { errorHandler } from './../global-error-handler';
import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user";
import { authMiddleware } from '../middlewares/auth';
import { getWishlistsByUserId } from '../controllers/wishlist';
import { getBlogsUserReacted } from '../controllers/liked-blog';

export const userRouter : Router = Router();

userRouter.get('/:id/wishlists', authMiddleware, getWishlistsByUserId);

userRouter.get('/:id/liked-blogs', authMiddleware, errorHandler(getBlogsUserReacted));

userRouter.get('/',authMiddleware, errorHandler(getAllUsers));
userRouter.get('/:id',authMiddleware, errorHandler(getUserById))
userRouter.put('/:id',authMiddleware, errorHandler(updateUser));
userRouter.delete('/:id',authMiddleware, errorHandler(deleteUser));
