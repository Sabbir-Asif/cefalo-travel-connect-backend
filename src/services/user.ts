import { UUID } from "crypto";
import { UserResponseDto } from "../dtos/user";
import { InternalException } from "../exceptions/internal-exception";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { UpdateUser, User, UserResponse } from "../interfaces/user";
import { IUserRepository } from "../repositories/user";
import { BadRequestException } from "../exceptions/bad-request";

export class UserService {
    constructor(private userRepository: IUserRepository) { };

    async getAllUsers(): Promise<UserResponse[]> {
        const users: User[] = await this.userRepository.findAllUsers();
        const responseData: UserResponse[] = users.map(user => new UserResponseDto(user));
        return responseData;
    }

    async getUserById(id: UUID): Promise<UserResponse> {
        const user: User | null = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException(`No user found with id ${id}`, ErrorCode.USER_NOTFOUND);
        }

        return new UserResponseDto(user);
    }

    async updateUser(id: UUID, data: UpdateUser): Promise<UserResponse> {
        const existingUser = await this.userRepository.findById(id);

        if (!existingUser) {
            throw new NotFoundException(`No user found with id ${id}`, ErrorCode.USER_NOTFOUND);
        }

        if (data.phone_number) {
            const userWithPhone = await this.userRepository.findByPhoneNumber(data.phone_number);
            if (userWithPhone && userWithPhone.id !== id) {
                throw new BadRequestException("Phone number already exists!", ErrorCode.PHONE_NUMBER_EXISTS);
            }
        }

        const user = await this.userRepository.update(id, data);

        if (!user) {
            throw new InternalException("Error updating user!", null, ErrorCode.INTERNAL_EXCEPTION);
        }

        return new UserResponseDto(user);
    }

    async deleteUser(id: UUID): Promise<void> {
        const existingUser = await this.userRepository.findById(id);

        if (!existingUser) {
            throw new NotFoundException(`No user found with id ${id}`, ErrorCode.USER_NOTFOUND);
        }

        await this.userRepository.delete(id);
    }

    async searchUsers(params: {
        name?: string;
        email?: string;
        phone_number?: string;
    }): Promise<UserResponse[]> {
        const users = await this.userRepository.search(params);

        return users.map(user => new UserResponseDto(user));
    }

}