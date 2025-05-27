// Update with your config settings.

import { PG_DATABASE_NAME, PG_USER, PG_PASSWORD, PG_PORT } from '../configs/secrets.ts'

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

export const development = {
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
    directory: './migrations'
  }
};
