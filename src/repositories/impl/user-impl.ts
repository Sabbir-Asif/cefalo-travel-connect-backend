import { db } from "../../configs/db";
import { CreateUserDTO } from "../../dtos/user";
import { User } from "../../entities/user";
import { IUserRepository } from "../user";

export class UserRepository implements IUserRepository {
    private tableName = 'users';

    async create(user: CreateUserDTO) : Promise<User> {
        const [newUser] = await db(this.tableName).insert({
            name: user.name,
            email: user.email,
            password: user.password
        }).returning('*');

        return {
            ...newUser,
            createdAt: new Date(newUser.createdAt),
            updatedAt: new Date(newUser.updatedAt)
        };
    }

    async findByEmail(email: string) : Promise<User | null> {

        const user = await db(this.tableName).where({email}).first();

        const result = user ? {
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
        } : null;

        return result;
    }
}