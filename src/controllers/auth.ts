import { Request, Response } from "express";
import { UserRepository } from "../repositories/impl/user-impl";
import { AuthService } from "../services/auth";
import { CreateUserSchema, LoginSchema } from "../schemas/user";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { CreateUserDto } from "../dtos/user";
import { UserResponse } from "../interfaces/user";
import { RefreshTokenService } from "../services/refresh-token";
import { RefreshTokenRepository } from "../repositories/impl/refresh-token-impl";
import { UUID } from "crypto";
import { TokenService } from "../services/token";
import { NextFunction } from "connect";
import { BadRequestException } from "../exceptions/bad-request";
import { IS_PRODUCTION, REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_EXPIRES_DAYS } from "../configs/secrets";


export let authService = new AuthService(new UserRepository());
export let refreshTokenService = new RefreshTokenService(new RefreshTokenRepository());

export const __setAuthService = (svc: AuthService) => { authService = svc; };
export const __setRefreshTokenService = (svc: RefreshTokenService) => { refreshTokenService = svc; };


export const signup = async (req: Request, res: Response) => {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, 'Validation error!', ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const userCreateDto = new CreateUserDto(parsed.data);

    const user: UserResponse = await authService.signup(userCreateDto);

    res.status(201).json(user);
}

export const login = async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, 'Validation error!', ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const { email, password } = parsed.data;

    const result = await authService.login(email, password);

    const refreshTokenObj = await refreshTokenService.issue(result.user.id);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME as string, refreshTokenObj.token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({
        accessToken: result.token,
        user: result.user,
    });
}

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME as string];

    if (!refreshToken) {
        throw new BadRequestException('Refresh token is required', ErrorCode.REFRESH_TOKEN_NOT_FOUND);
    }

    const newRefreshToken = await refreshTokenService.verifyAndRotate(refreshToken as unknown as UUID);

    const newAccessToken = TokenService.signAccessToken(newRefreshToken.user_id);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME as string, newRefreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccessToken });

}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME as string];

    if (!refreshToken) {
        throw new BadRequestException('Refresh token is required', ErrorCode.REFRESH_TOKEN_NOT_FOUND);
    }
    await refreshTokenService.revoke(refreshToken as unknown as UUID);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME as string, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });

    res.status(204).send();
    
}
