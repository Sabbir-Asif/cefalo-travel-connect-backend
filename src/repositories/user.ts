import { CreateUser, UpdateUser, User } from "../interfaces/user";

export interface IUserRepository {
    create(user: CreateUser) : Promise<User>;
    findByEmail(email: string) : Promise<User | null>;
    findById(id: number) : Promise<User | null>;
    findAllUsers() : Promise<User[]>;
    update(id: number, data: UpdateUser) : Promise<User | null>;
}