import { NextFunction, Request, RequestHandler, Response } from "express"
import { ErrorCode, HttpException } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";

export const errorHandler = (method: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return async (req, res, next) => {
        try {
            await method(req, res, next);
        } catch (err: any) {
            let exception: HttpException;
            if (err instanceof HttpException) {
                exception = err;
            } else {
                exception = new InternalException(err, 'Internal server error!', ErrorCode.INTERNAL_EXCEPTION);
            }
            next(exception);
        }
    };
};
