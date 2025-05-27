import dotenv from 'dotenv'

dotenv.config({path:'.env'});

export const PORT = parseInt(process.env.PORT!);
export const JWT_SECRET = process.env.JWT_SECRET!;
export const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS!);