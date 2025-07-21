import { Knex } from 'knex';
import { createDbConnection } from '../configs/db';

export class Database {
    private db: Knex;

    constructor() {
        this.db = createDbConnection();
    }

    get connection(): Knex {
        return this.db;
    }

    async connect(): Promise<void> {
        try {
            await this.db.raw('SELECT 1');
            console.log('Database connected successfully');
        } catch (err) {
            console.error('Database connection failed:', err);
            throw err;
        }
    }

    async seed(): Promise<void> {
        try {
            await this.db.seed.run();
            console.log('Database seeded successfully');
        } catch (err) {
            console.error('Database seeding failed:', err);
        }
    }

    async close(): Promise<void> {
        await this.db.destroy();
        console.log('Database connection closed');
    }
}
