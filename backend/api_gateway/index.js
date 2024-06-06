const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const proxyRouter = require("./routers/proxyRouter");
const helmet = require("helmet");
const rateLimitAndTimeout = require("./middleware/sessionLimiter");
const fileUploadMiddleware = require("./middleware/fileUpload");
const fs = require("fs");
const https = require("https");
const app = express();
const PORT = process.env.PORT;

const options = {
    key: fs.readFileSync('/certificates/localhost-key.pem'),
    cert: fs.readFileSync('/certificates/localhost.pem')
};

app.use(morgan('dev'));

app.use(cors({
    origin: ['https://localhost:3000', 'https://172.27.96.1:3000', 'https://192.168.1.3:3000'],
    credentials: true,
}));

app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    })
);

app.use(rateLimitAndTimeout);
app.use(fileUploadMiddleware);
app.use(helmet());
app.disable("x-powered-by");
app.use(proxyRouter);

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
