require('dotenv').config();
const PORT = process.env.PORT || 5000;

const express = require('express');
const app = new express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const router = require('./routes/index');
app.use('/api', router);

const errorHandler = require('./middleware/ErrorHandlingMiddleware');
app.use(errorHandler); // последний middleware, т.к. на нем работа прекращается, т.к. в нем нет функции next();

const sequelize = require('./db');
const models = require('./models/models');
async function start() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();     // сверяет состояние БД со описанной схемой даннчых
        app.listen(PORT, () => {
            console.log(`The server started on port ${PORT}`);
        });
    } catch (err) {
        console.log(`The server can't start because of: ${err}`);
    };
};
start();