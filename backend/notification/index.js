const express = require("express");
const session = require('express-session');

const app = express();


app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true
    })
);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Сервер запущен http://localhost:${PORT}`);
});