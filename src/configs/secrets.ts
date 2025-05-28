import dotenv from 'dotenv'

dotenv.config({path:'.env'});

export const PORT = parseInt(process.env.PORT!);
export const JWT_SECRET = process.env.JWT_SECRET;
export const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS!);
export const PG_DATABASE_NAME = process.env.PG_DATABASE_NAME;
export const PG_USER = process.env.PG_USER;
export const PG_PASSWORD = process.env.PG_PASSWORD;
export const PG_PORT = parseInt(process.env.PG_PORT!);