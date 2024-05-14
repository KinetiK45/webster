require ('reflect-metadata');
const path = require("path");

module.exports = {
    type: 'postgres',
    url: process.env.POSTGRES_URL,
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

