const path = require('path');
const { ConnectionOptionsReader, DataSource } = require('typeorm');

const configPath = path.resolve(__dirname, '../ormPostgresConfig.js');

const myDataSourcePromise = new Promise((resolve, reject) => {
    const optionsReader = new ConnectionOptionsReader({
        root: path.dirname(configPath),
        configName: path.basename(configPath, '.js'),
    });

    optionsReader
        .all()
        .then((options) => {
            if (options.length === 0) {
                throw new Error('No configuration options found');
            }

            const dbOptions = options[0];
            const dataSource = new DataSource(dbOptions);

            return dataSource.initialize().then(() => {
                console.log('Database initialized');
                resolve(dataSource);
            });
        })
        .catch((error) => {
            console.error('Error initializing data source:', error);
            reject(error);
        });
});

module.exports = myDataSourcePromise;
