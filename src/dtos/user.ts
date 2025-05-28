import { User } from './../entities/user';

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
}

export type UserResponseDTO = Omit<User, "password">;