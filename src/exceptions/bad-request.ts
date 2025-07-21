import { ErrorCode, HttpException } from "./root";

export class BadRequestException extends HttpException {
    constructor(message: string = "Bad Request!", errorCode: ErrorCode) {
        super(message, errorCode, 400, null);
    }
}