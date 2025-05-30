import knex from 'knex';
import dotenv from 'dotenv';
import { PG_DATABASE_NAME, PG_PASSWORD, PG_PORT, PG_USER } from './secrets';

dotenv.config();

const dbConfig = {
    client: 'postgresql',
    connection: {
        database: PG_DATABASE_NAME,
        user: PG_USER,
        password: PG_PASSWORD,
        port: PG_PORT
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        directory: '../db/migrations'
    }
}

export const db = knex(dbConfig);
