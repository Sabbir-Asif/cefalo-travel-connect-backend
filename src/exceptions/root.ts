export class HttpException extends Error {
    message: string;
    errorCode: ErrorCode;
    title: string;
    description: string;
    statusCode: number;
    errors: any;

    constructor(message: string, errorCode: ErrorCode, statusCode: number, errors: any) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.title = "Error";
        this.description = "Error performing operation!"
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export enum ErrorCode {
    USER_NOTFOUND = 1001,
    USER_ALREADY_EXISTS = 1002,
    PHONE_NUMBER_EXISTS = 1003,
    INCORRECT_PASSWORD = 1004,
    INVALID_USER_ID = 1005,
    UNPROCESSABLE_ENTITY = 2001,
    INTERNAL_EXCEPTION = 3001,
    UNAUTHORIZED = 4001,
    FORBIDDEN = 4002,
    INVALID_BLOG_ID = 5001,
    BLOG_NOT_FOUND = 5002,
    INVALID_TRANSPORT_ID = 6001,
    TRANSPORT_NOT_FOUND = 6002,
    INVALID_LODGE_ID = 7001,
    LODGE_NOT_FOUND = 7002,
    INVALID_TRAVEL_PLACE_ID = 8001,
    TRAVEL_PLACE_NOT_FOUND = 8002,
    INVALID_FOOD_ID = 9001,
    FOOD_NOT_FOUND = 9002,
    INVALID_BLOG_INSIGHT_ID = 10001,
    BLOG_INSIGHT_NOT_FOUND = 10002,
    INVALID_TRAVEL_PLAN_ID = 11001,
    TRAVEL_PLAN_NOT_FOUND = 11002,
    INVALID_WISHLIST_ID = 12001,
    WISHLIST_NOT_FOUND = 12002,
    INVALID_TRAVEL_REQUEST_ID = 13001,
    TRAVEL_REQUEST_NOT_FOUND = 13002,
    REFRESH_TOKEN_NOT_FOUND = 14001,
    TOKEN_EXPIRED = 14002,
    ALREADY_VERIFIED = 15001,
    INVALID_VERIFICATION_TOKEN = 15002,
    DISCUSSION_NOT_FOUND = 16001,
    INVALID_DISCUSSION_ID = 16002,
    INVALID_TOUR_TRANSPORT_ID = 17001,
    TOUR_TRANSPORT_NOT_FOUND = 17002,
    REACTION_NOT_FOUND = 18001,
}