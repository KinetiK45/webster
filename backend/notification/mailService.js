const amqplib = require('amqplib');
const nodemailer = require('nodemailer'); // Для отправки электронной почты

// Создаем почтовый транспорт
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'javawebtempmail@gmail.com',
        pass: 'ljgw wsww hvod tkpz'
    }
});

// Функция для отправки электронного письма
async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: to,
        subject: subject,
        text: text,
    };

    await transporter.sendMail(mailOptions);
}

async function listenForUserRegistrationEvents() {
    const queueName = 'user_registration';
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName);

    await channel.consume(queueName, async (message) => {
        if (!message) {
            return;
        }

        const event = JSON.parse(message.content.toString());
        const { email, eventName } = event;

        if (eventName === 'UserRegistered') {
            await sendEmail(email, 'Welcome!', 'Thanks for registering.');
        }

        channel.ack(message);
    });
}

// Запускаем прослушивание очереди
await listenForUserRegistrationEvents();
