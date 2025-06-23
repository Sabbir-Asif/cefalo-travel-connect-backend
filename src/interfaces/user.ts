import { UUID } from "crypto";
import { UserUpdateSchema } from "../schemas/user";
import { z } from 'zod'

export enum Role {
    ADMIN = "ADMIN",
    TRAVELER = "TRAVELER",
    EXPLORER = "EXPLORER"
}

export interface User {
    id: UUID;
    name: string;
    email: string;
    password: string;
    role: Role;
    displayPicture: string | null;
    bio: string | null;
    is_verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUser {
    name: string;
    email: string;
    password: string;
}

export type UserResponse = Omit<User, "password">;


export type UpdateUser = z.infer<typeof UserUpdateSchema>;
