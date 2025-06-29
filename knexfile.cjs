require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: process.env.PG_DATABASE_NAME,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/db/migrations'
    }
  }
};
