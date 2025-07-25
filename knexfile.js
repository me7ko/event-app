// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

require("dotenv").config();
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5433,
      database: process.env.DB_NAME || "eventapp",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "yourpassword",
    },
    migrations: {
      directory: "./migrations",
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
