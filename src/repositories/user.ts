import { UUID } from "crypto";
import { CreateUser, UpdateUser, User } from "../interfaces/user";

export interface IUserRepository {
    create(user: CreateUser): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findById(id: UUID): Promise<User | null>;
    findAllUsers(): Promise<User[]>;
    search(params: { name?: string; email?: string; phone_number?: string }): Promise<User[]>; 
    update(id: UUID, data: UpdateUser): Promise<User | null>;
    delete(id: UUID): Promise<void>;
}
