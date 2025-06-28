import { UserRepository } from './../repositories/impl/user-impl';
import { NextFunction, Request, Response } from "express";
import { UpdateUser, UserResponse } from "../interfaces/user";
import { UserService } from "../services/user";
import { UserUpdateSchema } from '../schemas/user';
import { UnprocessableEntityException } from '../exceptions/validation';
import { ErrorCode } from '../exceptions/root';
import { UpdateUserDto } from '../dtos/user';
import { IdSchema } from '../schemas/id';
import { BadRequestException } from '../exceptions/bad-request';
import { UUID } from 'crypto';

const userRepository = new UserRepository();
export let userService = new UserService(userRepository);

export const __setUserService = (svc: UserService) => { userService = svc; };


export const getUserById = async (req: Request, res: Response, next: NextFunction) => {

    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid user id!', ErrorCode.INVALID_USER_ID);
    }
    const userId = parsedId.data as UUID;

    const user: UserResponse = await userService.getUserById(userId);

    res.status(200).json(user);
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users: UserResponse[] = await userService.getAllUsers();

    res.status(200).json(users);
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {

    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid user id!', ErrorCode.INVALID_USER_ID);
    }
    const userId = parsedId.data as UUID;

    const parsed = UserUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, 'Validation error!', ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const updatedFields: UpdateUser = new UpdateUserDto(parsed.data);

    const user = await userService.updateUser(userId, updatedFields)

    res.status(200).json(user);
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const parsed = IdSchema.safeParse(id);

    if (!parsed.success) {
        throw new BadRequestException("Invalid user id", ErrorCode.INVALID_USER_ID);
    }

    const userId = parsed.data as UUID;
    await userService.deleteUser(userId);

    res.status(204).json({ success: true });
}