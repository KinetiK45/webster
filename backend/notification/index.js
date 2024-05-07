const express = require("express");
const session = require('express-session');
const {listenForUserRegistrationEvents, listenForUserLoginEvents, listenForUserResetEvents} = require("./service/rabbitService");
const {sendToS3} = require("./service/s3Service");

const app = express();


app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true
    })
);

// sendToS3()
//     .then((data) => {
//         console.log("File uploaded to S3");
//     })
//     .catch((error) => {
//         console.error("Error sending to S3:", error);
//     });

listenForUserRegistrationEvents().catch((error) => {
    console.error('Error starting listener registration:', error);
});

listenForUserLoginEvents().catch((error) => {
    console.error('Error starting listener login:', error);
});

listenForUserResetEvents().catch((error) => {
    console.error('Error starting listener login:', error);
});
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Сервер запущен http://localhost:${PORT}`);
});