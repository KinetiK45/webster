const amqplib = require('amqplib');
const uuid = require('uuid');
const {deleteProject} = require("./projectService");

async function createRabbitMQConnection() {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);

    process.on('exit', () => {
        console.log('Closing RabbitMQ connection...');
        connection.close();
    });
    return connection;
}
async function listenForDeleteProjectEvents() {
    const queueName = 'project_delete';
    const connection = await createRabbitMQConnection();
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    console.log(`Listening for messages in queue: ${queueName}`);
    await channel.consume(queueName, async (message) => {
        if (!message) {
            return;
        }

        const event = JSON.parse(message.content.toString());
        console.log('Received event:', event);

        const { project_id } = event;
        if (eventName === 'DeleteProject') {
            await deleteProject(project_id);
        }
        console.log("message: " + message);
        channel.ack(message);
    });
}

async function publishUpdateProjectEvent(project_id, url) {
    try {
        const queueName = 'project_update';
        const connection = await createRabbitMQConnection();
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName);

        const event = {
            eventId: uuid.v4(),
            project_id: project_id,
            url: url,
            eventName: 'UpdateProject',
            timestamp: new Date(),
        };

        console.log('Publishing update project event: ', event);
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)));

        await channel.close();
        await connection.close();
    } catch (error) {
        console.log('Publishing update project event: ' + error);
        throw error;
    }
}
module.exports = {
    listenForDeleteProjectEvents,
    publishUpdateProjectEvent
}