import { BCRYPT_SALT_ROUNDS, JWT_SECRET } from '../configs/secrets';
import { CreateUserDTO, UserResponseDTO } from '../dtos/user';
import { BadRequestException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';
import { IUserRepository } from '../repositories/user';
import {compare, hash} from 'bcrypt'
import { UnauthorizedException } from '../exceptions/unauthorized';
import * as jwt from 'jsonwebtoken';

export class AuthService {
    constructor(private userRepository: IUserRepository) {}

    async signup(userData: CreateUserDTO) : Promise<UserResponseDTO> {
        const existingUser = await this.userRepository.findByEmail(userData.email);

        if(existingUser) {
            throw new BadRequestException('Email already esists!',ErrorCode.USER_ALREADY_EXISTS);
        }

        const hashedPassword = await hash(userData.password,BCRYPT_SALT_ROUNDS);

        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword
        });

        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    async login(email: string, password: string) : Promise<{ user: UserResponseDTO, token: string }> {
        const user = await this.userRepository.findByEmail(email);

        if(!user) {
            throw new UnauthorizedException('No user found by this email!', ErrorCode.USER_NOTFOUND);
        }

        const isMatch = await compare(password, user.password);

        if(!isMatch) {
            throw new UnauthorizedException('Incorrect password!',ErrorCode.UNAUTHORIZED)
        }

        const token = jwt.sign({
            userId: user.id
        },JWT_SECRET);

        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            displayPicture: user.displayPicture,
            bio: user.bio,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

        return {
            user: userWithoutPassword,
            token: token
        };
        
    }
}