const amqplib = require('amqplib');
const sendEmail = require("./nodemailerService");
const {renderRegistration, renderConfirmationEmail, renderResetEmail} = require("./ejsService");
const logoUrl = "https://ucodewebster.s3.amazonaws.com/img.png";

async function createRabbitMQConnection() {
    return await amqplib.connect(process.env.RABBITMQ_URL);
}

async function createChannel(connection, queueName) {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    console.log(`Listening for messages in queue: ${queueName}`);
    return channel;
}

async function listenForEvents(queueName, eventName, callback) {
    try {
        const connection = await createRabbitMQConnection();
        const channel = await createChannel(connection, queueName);
        await channel.consume(queueName, async (message) => {
            if (!message) {
                return;
            }
            try {
                const event = JSON.parse(message.content.toString());
                console.log('Received event:', event);
                await callback(event, message);
            } catch (error) {
                console.error(`Error processing event for ${eventName}:`, error);
            } finally {
                channel.ack(message);
            }
        });
    } catch (error) {
        console.error(`Error listening for ${eventName} events:`, error);
    }
}

async function handleUserRegistrationEvent(event, message) {
    const { email, eventName, full_name } = event;
    const emailHtml = renderRegistration(full_name, logoUrl);
    if (eventName === 'UserRegistered') {
        await sendEmail(email, 'Welcome!', emailHtml);
    }
}

async function handleUserLoginEvent(event, message) {
    const { email, eventName, code, full_name } = event;
    const loginEmail = renderConfirmationEmail(logoUrl, full_name, code);
    if (eventName === 'UserLogin') {
        await sendEmail(email, 'Your Login Confirmation Code', loginEmail);
        console.log(`Email sent to ${email} with code: ${code}`);
    }
}

async function handleUserResetEvent(event, message) {
    const { email, eventName, code, full_name } = event;
    const resetEmail = renderResetEmail(logoUrl, full_name, code);
    if (eventName === 'UserReset') {
        await sendEmail(email, 'Your Login Confirmation Code', resetEmail);
        console.log(`Email sent to ${email} with code: ${code}`);
    }
}

async function listenForUserRegistrationEvents() {
    await listenForEvents('user_registration', 'user registration', handleUserRegistrationEvent);
}

async function listenForUserLoginEvents() {
    await listenForEvents('user_login', 'user login', handleUserLoginEvent);
}

async function listenForUserResetEvents() {
    await listenForEvents('user_reset', 'user reset', handleUserResetEvent);
}

module.exports = {
    listenForUserRegistrationEvents,
    listenForUserLoginEvents,
    listenForUserResetEvents
}
