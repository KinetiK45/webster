const express = require("express");
const session = require('express-session');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const mongoose = require("mongoose");
const router = require('./routers/router');
const {listenForDeleteProjectEvents} = require("./service/rabbitService");
const {registerFonts} = require("./helpers/loadFont");
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
app.use(router);
app.use(express.static('images'));
mongoose.connect(process.env.MONGO_DB_URL).then(() => {
    console.log('Connect to MongoDB success');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
registerFonts().then(() => {
    console.log('registered font success');
}).catch(err => {
    console.error('Error registered font:', err);
});

listenForDeleteProjectEvents().catch((error) => {
    console.error('Error starting listener login:', error);
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});