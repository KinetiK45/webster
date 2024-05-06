require ('reflect-metadata');
const path = require("path");

module.exports = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5433,
    username: process.env.DATABASE_USER || 'mpoljatsky',
    password: process.env.DATABASE_PASSWORD || 'securepass',
    database: process.env.DATABASE_NAME || 'webster',
    synchronize: true,
    logging: true,
    entities: [path.join(__dirname, 'model', 'users.js')],
    // migrations: [path.join(__dirname, 'migrations', '*.js')],
    // subscribers: [path.join(__dirname, 'subscribers', '*.js')],
    cli: {
        entitiesDir: './model',
    //     migrationsDir: 'migrations',
    //     subscribersDir: 'subscribers',
    },
};

