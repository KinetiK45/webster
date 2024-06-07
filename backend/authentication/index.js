const express = require("express");
const session = require('express-session');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const router = require("./routers/router");
const morgan = require('morgan');


const app = express();

app.use(cors({
    origin: ['*'],
    credentials: true,
}));

app.use(morgan('dev'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router);
app.use(express.static('images'));

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});