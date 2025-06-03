import { errorHandler } from './../global-error-handler';
import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user";

export const userRouter : Router = Router();

userRouter.get('/',errorHandler(getAllUsers));
userRouter.get('/:id',errorHandler(getUserById))
userRouter.put('/:id',errorHandler(updateUser));
userRouter.delete('/:id',errorHandler(deleteUser));