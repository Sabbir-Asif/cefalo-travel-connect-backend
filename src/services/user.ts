import { UserResponseDto } from "../dtos/user";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { User, UserResponse } from "../interfaces/user";
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
}