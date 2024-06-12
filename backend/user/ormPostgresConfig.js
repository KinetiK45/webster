require ('reflect-metadata');
const path = require("path");

module.exports = {
    type: 'postgres',
    // url: process.env.POSTGRES_URL,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: true,
    entities: [path.join(__dirname, 'model', '*.js')],
    // migrations: [path.join(__dirname, 'migrations', '*.js')],
    // subscribers: [path.join(__dirname, 'subscribers', '*.js')],
    // cli: {
    //     entitiesDir: './model',
    // //     migrationsDir: 'migrations',
    // //     subscribersDir: 'subscribers',
    // },
};

