import { Router } from "express";
import { deleteUser, getAllUsers, updateUser } from "../controllers/user";

export const userRouter : Router = Router();

userRouter.put('/:id',updateUser);
userRouter.delete('/:id',deleteUser);
userRouter.get('/',getAllUsers);