import { UserResponseDto } from "../dtos/user";
import { InternalException } from "../exceptions/internal-exception";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { UpdateUser, User, UserResponse } from "../interfaces/user";
import { IUserRepository } from "../repositories/user";

export class UserService {
    constructor(private userRepository: IUserRepository) {};

    async getAllUsers() : Promise<UserResponse[]> {
        const users: User[] = await this.userRepository.findAllUsers();
        const responseData: UserResponse[] = users.map(user => new UserResponseDto(user));
        return responseData;
    }

    async getUserById(id: number) : Promise<UserResponse> {
        const user : User | null = await this.userRepository.findById(id);

        if(!user) {
            throw new NotFoundException(`No user found with id ${id}`, ErrorCode.USER_NOTFOUND);
        }

        return new UserResponseDto(user);
    }

    async updateUser(id: number, data: UpdateUser) : Promise<UserResponse> {
        const existingUser = await this.userRepository.findById(id);

         if(!existingUser) {
            throw new NotFoundException(`No user found with id ${id}`, ErrorCode.USER_NOTFOUND);
        }

        const user = await this.userRepository.update(id, data);

        if(!user) {
            throw new InternalException("Error updating user!", null, ErrorCode.INTERNAL_EXCEPTION);
        }

        return new UserResponseDto(user);
    }
}