import { NextFunction, Request, Response } from "express"
import { ForbiddenException } from "../exceptions/forbidden";
import { ErrorCode } from "../exceptions/root";
import { User } from "../interfaces/user";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    if(user.role === "ADMIN") {
        next();
    } else {
        next(new ForbiddenException('forbidden!', ErrorCode.FORBIDDEN))
    }
}