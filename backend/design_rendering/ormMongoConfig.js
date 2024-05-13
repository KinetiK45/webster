require ('reflect-metadata');
const path = require("path");

module.exports = {
    type: 'mongodb',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    // username: process.env.DATABASE_USER,
    // password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    synchronize: true,
    logging: true,
    entities: [
        path.join(__dirname, 'model', '*.js')
    ],
};
