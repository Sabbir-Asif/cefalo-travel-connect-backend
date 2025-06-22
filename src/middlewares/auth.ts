import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../configs/secrets";
import { userService } from "../controllers/user";
import { UUID } from "crypto";
import { TokenService } from "../services/token";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if(!token) {
        throw new UnauthorizedException('Token not found', ErrorCode.UNAUTHORIZED);
    }

    try {
        const payload = TokenService.verifyAccessToken(token);
        const userId = payload.userId;
        const user = await userService.getUserById(userId)

        if(!user) {
            next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
        }

        req.user = user;
        next();
    } catch (err) {
       next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
}