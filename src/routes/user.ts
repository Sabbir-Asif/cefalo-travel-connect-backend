import { Router } from "express";
import { deleteUser, getAllUsers, updateUser } from "../controllers/user";

export const userRouter : Router = Router();

userRouter.get('/',getAllUsers);
userRouter.get('/:id',)
userRouter.put('/:id',updateUser);
userRouter.delete('/:id',deleteUser);