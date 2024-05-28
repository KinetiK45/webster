const amqplib = require ('amqplib');
const uuid = require('uuid');

async function createRabbitMQConnection() {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    process.on('exit', () => {
        console.log('Closing RabbitMQ connection...');
        connection.close();
    });
    return connection;
}

async function publishDeleteProjectEvent(project_id) {
    try {
        const queueName = 'project_delete';
        const connection = await createRabbitMQConnection();
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName);

        const event = {
            eventId: uuid.v4(),
            project_id: project_id,
            eventName: 'DeleteProject',
            timestamp: new Date(),
        };

        console.log('Publishing delete project event: ', event);
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)));

        await channel.close();
        await connection.close();
    } catch (error) {
        console.log('Publishing delete project event: ' + error);
        throw error;
    }
}

module.exports = {
   publishDeleteProjectEvent
}

