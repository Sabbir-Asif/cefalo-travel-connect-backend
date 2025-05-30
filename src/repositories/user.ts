import { CreateUser, User } from "../interfaces/user";

export interface IUserRepository {
    create(user: CreateUser) : Promise<User>;
    findByEmail(email: string) : Promise<User | null>;
}