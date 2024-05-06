const express = require("express");
const session = require('express-session');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const {client} = require("./service/authenticationService");
const router = require("./router");

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.1.2:3000', 'http://192.168.1.3:3000'],
    credentials: true,
}));

app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true
    })
);

client.on('error', (err) => {
    console.error('Redis error:', err);
});
client.on('connect', () => {
    console.log('Connected to Redis');
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);
app.use(express.static('images'));
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Сервер запущен http://localhost:${PORT}`);
});