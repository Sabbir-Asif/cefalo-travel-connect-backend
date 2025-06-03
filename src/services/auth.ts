import { BCRYPT_SALT_ROUNDS, JWT_SECRET } from '../configs/secrets';
import { BadRequestException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';
import { IUserRepository } from '../repositories/user';
import { compare, hash } from 'bcrypt'
import { UnauthorizedException } from '../exceptions/unauthorized';
import * as jwt from 'jsonwebtoken';
import { CreateUser, User, UserResponse } from '../interfaces/user';
import { CreateUserDto, UserResponseDto } from '../dtos/user';

export class AuthService {
    constructor(private userRepository: IUserRepository) { }

    async signup(userData: CreateUser): Promise<UserResponse> {
        const existingUser = await this.userRepository.findByEmail(userData.email);

        if (existingUser) {
            throw new BadRequestException('Email already esists!', ErrorCode.USER_ALREADY_EXISTS);
        }

        const hashedPassword = await hash(userData.password, BCRYPT_SALT_ROUNDS);

        const user : User = await this.userRepository.create({
            ...userData,
            password: hashedPassword
        });

       const userResponse = new UserResponseDto(user);

        return userResponse;
    }

    async login(email: string, password: string): Promise<{ user: UserResponse, token: string }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('No user found by this email!', ErrorCode.USER_NOTFOUND);
        }

        const isMatch = await compare(password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Incorrect password!', ErrorCode.UNAUTHORIZED)
        }

        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET);

       const userResponse = new UserResponseDto(user);

        return {
            user: userResponse,
            token: token
        };
    }
}