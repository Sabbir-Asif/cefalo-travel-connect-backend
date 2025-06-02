import { UserRepository } from './../repositories/impl/user-impl';
import { NextFunction, Request, Response } from "express";
import { UserResponse } from "../interfaces/user";
import { UserService } from "../services/user";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);


export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.id);
    const user: UserResponse = await userService.getUserById(userId);

    res.status(200).json(user);
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users: UserResponse[] = await userService.getAllUsers();

    res.status(200).json(users);
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    res.json('update user called');
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    res.json('delete user called');
}