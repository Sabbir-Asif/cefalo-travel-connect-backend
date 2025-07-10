import { ErrorCode } from './root';
import { HttpException } from "./root";

export class NotFoundException extends HttpException {
    constructor(message: string = "Not Found!", errorCode: ErrorCode) {
        super(message, errorCode, 404, null)
    }
}