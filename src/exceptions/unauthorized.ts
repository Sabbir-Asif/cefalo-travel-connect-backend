import { ErrorCode, HttpException } from "./root";

export class UnauthorizedException extends HttpException {
    constructor(message: string = "Unauthorized!", errorCode: ErrorCode) {
        super(message, errorCode, 401, null);
    }
}