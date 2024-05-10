const amqplib = require ('amqplib');
const uuid = require('uuid');
async function createRabbitMQConnection() {
    const connection = await amqplib.connect('amqp://localhost');

    process.on('exit', () => {
        console.log('Closing RabbitMQ connection...');
        connection.close();
    });
    return connection;
}

async function publishUserLoginEvent(code, userId, full_name, email) {
    try {
        const queueName = 'user_login';
        const connection = await createRabbitMQConnection();
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName);

        const event = {
            eventId: uuid.v4(),
            userId: userId,
            full_name: full_name,
            code: code,
            email: email,
            eventName: 'UserLogin',
            timestamp: new Date(),
        };

        console.log('Publishing login event: ', event);
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)));

        await channel.close();
        await connection.close();
    } catch (error) {
        console.log('Publishing login event: ' + error);
        throw error;
    }
}


module.exports = {
    publishUserLoginEvent,
}

