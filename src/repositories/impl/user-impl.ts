import { db } from "../../configs/db";
import { CreateUser, UpdateUser } from "../../interfaces/user";
import { User } from "../../interfaces/user";
import { IUserRepository } from "../user";

export class UserRepository implements IUserRepository {
    private tableName = 'users';

    async create(user: CreateUser): Promise<User> {
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

    async findByEmail(email: string): Promise<User | null> {

        const user = await db(this.tableName).where({ email }).first();

        const result = user ? {
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
        } : null;

        return result;
    }

    async findAllUsers(): Promise<User[]> {
        const users: User[] = await db(this.tableName).select('*');

        return users;
    }

    async findById(id: number): Promise<User | null> {
        const user: User = await db(this.tableName).where({id}).first();
        const result = user ? {
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
        } : null;

        return result;
    }

    async update(id: number, data: UpdateUser): Promise<User> {
        const [user] = await db(this.tableName)
        .where({id})
        .update({...data, updatedAt: new Date()})
        .returning('*');

        const result = user ? {
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
        } : null;

        return result;
    }
}