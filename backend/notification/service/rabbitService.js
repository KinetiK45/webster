const amqplib = require('amqplib');
const sendEmail = require("./nodemailerService");
const {renderRegistration, renderConfirmationEmail, renderResetEmail} = require("./ejsService");
const path = require("path");
const logoUrl = ("https://ucodewebster.s3.amazonaws.com/img.png");
async function createRabbitMQConnection() {
    const connection = await amqplib.connect('amqp://localhost');

    process.on('exit', () => {
        console.log('Closing RabbitMQ connection...');
        connection.close();
    });
    return connection;
}
async function listenForUserRegistrationEvents() {
    const queueName = 'user_registration';
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

        const { email, eventName , full_name} = event;
        const emailHtml = renderRegistration(full_name, logoUrl);
        if (eventName === 'UserRegistered') {
            await sendEmail(email, 'Welcome!', emailHtml);
        }
        console.log("message: " + message);
        channel.ack(message);
    });
}
async function listenForUserLoginEvents() {
    try {
        const queueName = 'user_login';
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
            console.log("Logo URL:", logoUrl);
            const { email, eventName, code, full_name } = event;
            const loginEmail = renderConfirmationEmail(logoUrl,full_name,code);
            if (eventName === 'UserLogin') {
                await sendEmail(email, 'Your Login Confirmation Code', loginEmail);
                console.log(`Email sent to ${email} with code: ${code}`);
            }
            channel.ack(message);
        });
    } catch (error) {
        console.error('Error listening for user login events:', error);
    }
}
async function listenForUserResetEvents(){
    try {
        const queueName = 'user_reset';
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
            const { email, eventName, code, full_name } = event;
            const resetEmail = renderResetEmail(logoUrl,full_name,code);
            if (eventName === 'UserReset') {
                await sendEmail(email, 'Your Login Confirmation Code', resetEmail);
                console.log(`Email sent to ${email} with code: ${code}`);
            }
            channel.ack(message);
        });
    } catch (error) {
        console.error('Error listening for user login events:', error);
    }
}
module.exports = {
    listenForUserRegistrationEvents,
    listenForUserLoginEvents,
    listenForUserResetEvents
}