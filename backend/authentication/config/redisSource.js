const redis = require("redis");

const client = redis.createClient({
    url: 'redis://127.0.0.1:6379'
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.connect();
client.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});
process.on('exit', () => {
    console.log('Closing Redis client...');
    client.quit();
});
// const flushdbAsync = promisify(client.flushdb).bind(client);

const flushDatabase = async () => {
    try {
        const result = client.flushdb;
        console.log(`Database flushed: ${result}`);
    } catch (err) {
        console.error('Error flushing database:', err);
    }
};

setInterval(flushDatabase, 10 * 60 * 1000);
process.on('SIGINT', () => {
    console.log('Application interrupted, closing Redis client...');
    client.disconnect();
    process.exit();
});

module.exports = client;