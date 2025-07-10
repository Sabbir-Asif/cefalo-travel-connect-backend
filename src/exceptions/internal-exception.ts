import { ErrorCode, HttpException } from "./root";

export class InternalException extends HttpException {
    constructor(message: string = "Internal Exception!", errors: any, errorCode: ErrorCode) {
        super(message, errorCode, 500, errors)
    }
}