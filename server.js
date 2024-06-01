
require('dotenv').config();

const db = require('./config/db');
db.connect();

const chalk = require('chalk');

const express = require('express');
const app = express();
app.disable('x-powered-by');

var cors = require('cors')
app.use(cors())

const routes = require('./routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);



app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        message: 'Resource not found'
    })
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        message: 'Internal server error'
    })
});

app.listen((process.env.PORT), () => {
    console.log(chalk.cyanBright(`\n--- Server started on port ${process.env.PORT}`));
});
