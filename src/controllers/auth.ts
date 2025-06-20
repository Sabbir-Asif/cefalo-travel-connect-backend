import { Request, Response } from "express";
import { UserRepository } from "../repositories/impl/user-impl";
import { AuthService } from "../services/auth";
import { CreateUserSchema, LoginSchema } from "../schemas/user";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { CreateUserDto } from "../dtos/user";
import { UserResponse } from "../interfaces/user";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export const signup = async (req: Request, res: Response) => {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, 'Validation error!', ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const userCreateDto = new CreateUserDto(parsed.data);

    const user: UserResponse = await authService.signup(userCreateDto);

    res.status(201).json(user);
}

export const login = async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, 'Validation error!', ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const { email, password } = parsed.data;

    const result = await authService.login(email, password);

    res.json(result);
}