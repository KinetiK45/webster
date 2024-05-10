const path = require('path');
const { createConnection, ConnectionOptionsReader, DataSource } = require('typeorm');
const {Users} = require("../model/users");

const configPath = path.resolve(__dirname, '../ormconfig.js');
console.log('Configuration path:', configPath);

const myDataSourcePromise = new Promise((resolve, reject) => {
    createConnection({
        name: 'default',
        ...require(configPath)
    })
        .then((connection) => {
            console.log('Database initialized');
            resolve(connection);
        })
        .catch((error) => {
            console.error('Error initializing data source:', error);
            reject(error);
        });
});


module.exports = myDataSourcePromise;
