const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 7777;

const connection = mysql.createConnection({
    host: 's91226tr.beget.tech',
    user: 's91226tr_a',
    database: 's91226tr_a',
    password: 'I2K1U&mI'
});

connection.connect((err) => {
    if (err) {
        console.log('ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!', err);
    } else {
        console.log('OKKKKKKKKKKKKKKKKKKKKKKKKKKKAAYYYYYYYYYYY!!!!!!!!!')
    };
});

app.listen(port, () => {
    console.log('server is OK');
});