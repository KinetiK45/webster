require ('reflect-metadata');
const path = require("path");

module.exports = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'root',
    database: 'webster',
    synchronize: true,
    logging: true,
    entities: [path.join(__dirname, 'model', 'users.js')],
    // migrations: [path.join(__dirname, 'migrations', '*.js')],
    // subscribers: [path.join(__dirname, 'subscribers', '*.js')],
    // cli: {
    //     entitiesDir: './model',
    // //     migrationsDir: 'migrations',
    // //     subscribersDir: 'subscribers',
    // },
};

