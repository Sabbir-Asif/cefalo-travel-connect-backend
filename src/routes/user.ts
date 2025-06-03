import { errorHandler } from './../global-error-handler';
import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user";
import { authMiddleware } from '../middlewares/auth';

export const userRouter : Router = Router();

userRouter.get('/',authMiddleware, errorHandler(getAllUsers));
userRouter.get('/:id',authMiddleware, errorHandler(getUserById))
userRouter.put('/:id',authMiddleware, errorHandler(updateUser));
userRouter.delete('/:id',authMiddleware, errorHandler(deleteUser));
