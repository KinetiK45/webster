const express = require('express')
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const router = require("./router");
const amqp = require('amqplib');

const app = express();
const PORT =  3001;

app.use(cors({
    origin: ['http://localhost:3000', 'http://172.27.96.1:3000', 'http://192.168.1.3:3000'],
    credentials: true,
}));

app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true
    })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

// // Підключення до RabbitMQ
// let channel;
// amqp.connect(RABBITMQ_URL)
//     .then(connection => connection.createChannel())
//     .then(ch => {
//         channel = ch;
//         console.log('Connected to RabbitMQ');
//     })
//     .catch(err => console.error('Error connecting to RabbitMQ:', err));

// // Маршрут для проксіювання запитів до мікросервісів
// app.all('/api/*', async (req, res) => {
//     try {
//         const microserviceUrl = req.url.replace(/^\/api/, ''); // Визначаємо URL мікросервісу
//         const queueName = 'microservices_queue'; // Назва черги RabbitMQ
//
//         // Відправляємо повідомлення до черги
//         channel.sendToQueue(queueName, Buffer.from(JSON.stringify({
//             url: microserviceUrl,
//             method: req.method,
//             body: req.body,
//             headers: req.headers
//         })));
//
//         // Очікуємо відповідь з черги
//         channel.consume(queueName, message => {
//             const { status, data } = JSON.parse(message.content.toString());
//             res.status(status).send(data);
//             channel.ack(message);
//         }, { noAck: false });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.listen(PORT, () => {
    console.log(`API Gateway listening on  http://localhost:${PORT}`);
});
