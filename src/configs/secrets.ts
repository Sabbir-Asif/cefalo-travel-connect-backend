import dotenv from 'dotenv'

dotenv.config({path:'.env'});

export const PORT = parseInt(process.env.PORT!);
export const JWT_SECRET = process.env.JWT_SECRET!;
export const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS!);
export const PG_DATABASE_NAME = process.env.PG_DATABASE_NAME;
export const PG_USER = process.env.PG_USER;
export const PG_PASSWORD = process.env.PG_PASSWORD;
export const PG_PORT = parseInt(process.env.PG_PORT!);
export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m';
export const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS!);
export const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME;
export const NODE_ENV = process.env.NODE_ENV;
export const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';
export const VERIFICATION_TOKEN_EXPIRY_MINUTES = parseInt(process.env.VERIFICATION_TOKEN_EXPIRY_MINUTES!);
export const SMTP_HOST = process.env.SMTP_HOST!;
export const SMTP_PORT = parseInt(process.env.SMTP_PORT!);
export const SMTP_USER = process.env.SMTP_USER!;
export const SMTP_PASS = process.env.SMTP_PASS!;
