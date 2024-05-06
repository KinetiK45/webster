const amqplib = require ('amqplib');
const uuid = require('uuid');

async function publishUserRegisteredEvent(userId, email) {
    const queueName = 'user_registration';
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName);

    const event = {
        eventId: uuid.v4(),
        userId: userId,
        email: email,
        eventName: 'UserRegistered',
        timestamp: new Date(),
    };

    console.log('Publishing event:', event);
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)));

    await channel.close();
    await connection.close();
}

module.exports = {
    publishUserRegisteredEvent
}

