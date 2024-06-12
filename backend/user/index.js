const express = require("express");
const session = require('express-session');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const router = require("./routers/router");
const morgan = require('morgan');
const tokenMiddleware = require("./middleware/verifyToken");
const {listenForUpdateProjectEvents} = require("./service/rabbitService");

const app = express();

app.use(cors({
    origin: ['*'],
    credentials: true,
}));

app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true
    })
);
app.use(morgan('dev'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(tokenMiddleware);
app.use(router);
app.use(express.static('images'));

const PORT = process.env.PORT;
// listenForUpdateProjectEvents().catch((error) => {
//     console.error('Error starting listener login:', error);
    // process.exit(1);
// });
app.listen(PORT, () => {
    console.log(`Сервер запущен http://localhost:${PORT}`);
});