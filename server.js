require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');
const path = require('path');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/fetch-data', (req, res) => {
    connection.query('SELECT data FROM example', function (error, results, fields) {
        if (error) {
            return res.status(500).json({ error: 'An error occurred' });
        } else {
            console.log("Data fetched:", results);
            const myValue = results.map(result => result.data).join(', ');
            return res.json({myValue: myValue});
        }
    });
});


// app.get('/', (req, res) => {
//     connection.query('SELECT data FROM example', function (error, results, fields) {
//         if (error) {
//             res.send("An error occured");
//         }
//         const textResult = results.map(result => result.data).join(', ');
//         res.send(textResult);
//     });
// });

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});