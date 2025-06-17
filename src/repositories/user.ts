import { UUID } from "crypto";
import { CreateUser, UpdateUser, User } from "../interfaces/user";

export interface IUserRepository {
    create(user: CreateUser) : Promise<User>;
    findByEmail(email: string) : Promise<User | null>;
    findById(id: UUID) : Promise<User | null>;
    findAllUsers() : Promise<User[]>;
    update(id: UUID, data: UpdateUser) : Promise<User | null>;
}