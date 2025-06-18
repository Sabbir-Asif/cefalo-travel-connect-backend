export class HttpException extends Error {
    message: string;
    errorCode: ErrorCode;
    statusCode: number;
    errors: any;

    constructor(message: string, errorCode: ErrorCode, statusCode: number, errors: any) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export enum ErrorCode {
    USER_NOTFOUND = 1001,
    USER_ALREADY_EXISTS = 1002,
    INCORRECT_PASSWORD = 1003,
    INVALID_USER_ID = 1004,
    UNPROCESSABLE_ENTITY = 2001,
    INTERNAL_EXCEPTION = 3001,
    UNAUTHORIZED = 4001,
    FORBIDDEN = 4002,
    INVALID_BLOG_ID = 5001,
    BLOG_NOT_FOUND = 5002,
    INVALID_TRANSPORT_ID = 6001,
    TRANSPORT_NOT_FOUND = 6002
}