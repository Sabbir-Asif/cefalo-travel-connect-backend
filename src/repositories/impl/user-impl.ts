import { UUID } from "crypto";
import { db } from "../../configs/db";
import { CreateUser, UpdateUser, User } from "../../interfaces/user";
import { IUserRepository } from "../user";

export class UserRepository implements IUserRepository {
    private tableName = "users";

    async create(user: CreateUser): Promise<User> {
        const [newUser] = await db(this.tableName).insert({
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            password: user.password
        }).returning("*");

        return this.toModel(newUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await db(this.tableName).where({ email }).first();
        return user ? this.toModel(user) : null;
    }

    async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        const user = await db(this.tableName).where({ phone_number: phoneNumber }).first();
        return user ? this.toModel(user) : null;
    }

    async findAllUsers(): Promise<User[]> {
        const users = await db(this.tableName).select("*");
        return users.map(this.toModel);
    }

    async findById(id: UUID): Promise<User | null> {
        const user = await db(this.tableName).where({ id }).first();
        return user ? this.toModel(user) : null;
    }

    async update(id: UUID, data: UpdateUser): Promise<User | null> {
        const [user] = await db(this.tableName)
            .where({ id })
            .update({ ...data, updatedAt: new Date() })
            .returning("*");

        return user ? this.toModel(user) : null;
    }

    async delete(id: UUID): Promise<void> {
        await db(this.tableName).where({ id }).del();
    }

    async search(params: { name?: string; email?: string; phone_number?: string }): Promise<User[]> {
        const query = db(this.tableName).select("*");

        if (params.name) {
            query.whereILike("name", `%${params.name}%`);
        }

        if (params.email) {
            query.whereILike("email", `%${params.email}%`);
        }

        if (params.phone_number) {
            query.whereILike("phone_number", `%${params.phone_number}%`);
        }

        const users = await query;
        return users.map(this.toModel);
    }

    private toModel = (row: any): User => ({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
    });
}
