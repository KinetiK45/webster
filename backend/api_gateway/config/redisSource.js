const redis = require("redis");

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
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

process.on('SIGINT', () => {
    console.log('Application interrupted, closing Redis client...');
    client.disconnect();
    process.exit();
});

module.exports = client;