const amqplib = require ('amqplib');
const uuid = require('uuid');
const {updateProject} = require("./projectService");

async function createRabbitMQConnection() {
    return await amqplib.connect(process.env.RABBITMQ_URL);
}

async function createChannel(connection, queueName) {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    return channel;
}

async function publishDeleteProjectEvent(project_id) {
    try {
        const queueName = 'project_delete';
        const connection = await createRabbitMQConnection();
        const channel = await createChannel(connection, queueName);

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

async function listenForUpdateProjectEvents() {
    const queueName = 'project_update';
    const connection = await createRabbitMQConnection();
    const channel = await createChannel(connection, queueName);

    await channel.assertQueue(queueName, { durable: true });
    console.log(`Listening for messages in queue: ${queueName}`);
    await channel.consume(queueName, async (message) => {
        if (!message) {
            return;
        }

        const event = JSON.parse(message.content.toString());
        console.log('Received event:', event);

        const { project_id, url, eventName } = event;
        if (eventName === 'UpdateProject') {
            await updateProject(project_id,"",url);
        }
        console.log("message: " + message);
        channel.ack(message);
    });
}


module.exports = {
   publishDeleteProjectEvent,
   listenForUpdateProjectEvents
}

