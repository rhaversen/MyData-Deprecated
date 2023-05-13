const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'rhaversen',
    password: 'WDR69gjv',
    database: 'mydatabase'
});

app.get('/', (req, res) => {
    connection.query('SELECT data FROM example', function (error, results, fields) {
        if (error) {
            res.send("An error occured");
        }
        const textResult = results.map(result => result.data).join(', ');
        res.send(textResult);
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});