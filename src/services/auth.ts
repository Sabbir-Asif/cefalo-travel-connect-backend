import { BCRYPT_SALT_ROUNDS} from '../configs/secrets';
import { BadRequestException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';
import { IUserRepository } from '../repositories/user';
import { compare, hash } from 'bcrypt'
import { UnauthorizedException } from '../exceptions/unauthorized';
import { CreateUser, User, UserResponse } from '../interfaces/user';
import { UserResponseDto } from '../dtos/user';
import { TokenService } from './token';
import { emailVerificationService } from '../controllers/email-verification';
import { InternalException } from '../exceptions/internal-exception';

export class AuthService {
    constructor(private userRepository: IUserRepository) { }

    async signup(userData: CreateUser): Promise<UserResponse> {
        const existingUser = await this.userRepository.findByEmail(userData.email);

        if (existingUser) {
            throw new BadRequestException('Email already exists!', ErrorCode.USER_ALREADY_EXISTS);
        }

        const hashedPassword = await hash(userData.password, BCRYPT_SALT_ROUNDS);

        const user: User = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
        });

        const userResponse = new UserResponseDto(user);

        try {
            if (!user.is_verified) {
                await emailVerificationService.initiateVerification(user.id, user.email, user.name);
            }
        } catch (err) {
            throw new InternalException("Error initiating email verification", err, ErrorCode.INTERNAL_EXCEPTION);
        }

        return userResponse;
    }

    async login(email: string, password: string): Promise<{ user: UserResponse, token: string }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('No user found by this email!', ErrorCode.USER_NOTFOUND);
        }

        if(!user.is_verified) {
            throw new UnauthorizedException('Email is not verified!', ErrorCode.UNAUTHORIZED);
        }

        const isMatch = await compare(password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Incorrect password!', ErrorCode.UNAUTHORIZED)
        }

        const token = TokenService.signAccessToken(user.id);

        const userResponse = new UserResponseDto(user);

        return {
            user: userResponse,
            token: token
        };
    }
}