import { CreateUserDTO } from "../dtos/user";
import { User } from "../entities/user";

export interface IUserRepository {
    create(user: CreateUserDTO) : Promise<User>;
    findByEmail(email: string) : Promise<User | null>;
}