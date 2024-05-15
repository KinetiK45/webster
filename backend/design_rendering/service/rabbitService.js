const amqplib = require('amqplib');
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
module.exports = {
    listenForDeleteProjectEvents
}