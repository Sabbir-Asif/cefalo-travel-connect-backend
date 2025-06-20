import { errorHandler } from './../global-error-handler';
import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user";
import { authMiddleware } from '../middlewares/auth';
import { getWishlistsByUserId } from '../controllers/wishlist';

export const userRouter : Router = Router();

userRouter.get('/:id/wishlists', authMiddleware, getWishlistsByUserId);

userRouter.get('/',authMiddleware, errorHandler(getAllUsers));
userRouter.get('/:id',authMiddleware, errorHandler(getUserById))
userRouter.put('/:id',authMiddleware, errorHandler(updateUser));
userRouter.delete('/:id',authMiddleware, errorHandler(deleteUser));
