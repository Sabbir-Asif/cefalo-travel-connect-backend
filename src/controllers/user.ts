import { UserRepository } from './../repositories/impl/user-impl';
import { NextFunction, Request, Response } from "express";
import { UpdateUser, UserResponse } from "../interfaces/user";
import { UserService } from "../services/user";
import { UserUpdateSchema } from '../schemas/user';
import { UnprocessableEntityException } from '../exceptions/validation';
import { ErrorCode } from '../exceptions/root';
import { UpdateUserDto } from '../dtos/user';

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
    const userId = Number(req.params.id);
    const parsed = UserUpdateSchema.safeParse(req.body);

    if(!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, 'Validation error!', ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const updatedFields: UpdateUser = new UpdateUserDto(parsed.data);

    const user = await userService.updateUser(userId, updatedFields)
    
    res.status(200).json(user);
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    res.json('delete user called');
}