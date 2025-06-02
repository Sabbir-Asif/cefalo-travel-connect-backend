import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user";

export const userRouter : Router = Router();

userRouter.get('/',getAllUsers);
userRouter.get('/:id',getUserById)
userRouter.put('/:id',updateUser);
userRouter.delete('/:id',deleteUser);