require('dotenv').config();

const express = require('express');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const validator = require('validator');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();

const jwtSecret = process.env.JWT_secret

const port = 3000;

//const testRouter = require('./testrouter');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(express.static('public'));
app.use(handleError);

//app.use('/users', testRouter);

// Set up express application
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(session({ secret: jwtSecret, resave: false, saveUninitialized: false }));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    function(email, password, done) {
        connection.query('SELECT password FROM users WHERE email = ?', [email], function (error, results, fields) {
            if (error) { return done(error); }
            if (!results.length) { return done(null, false); }
            const hash = results[0].password.toString();
            bcrypt.compare(password, hash, function(err, response) {
                if (response === true) {
                    return done(null, { user_id: results[0].id });
                } else {
                    return done(null, false);
                }
            });
        });
    }
));

//Show index page
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.get('/signup', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/signup.html'));
});

//Token signing
function signToken(id) {
    return jwt.sign({ id: id }, jwtSecret, { expiresIn: 86400 });// expires in 24 hours
}

//Error handling middleware
function handleError(error, req, res, next) {
    console.log("error caught by errorhandler middleware");
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).send('Email already in use.');
    } else {
        // Handle other errors
        return res.status(500).send('There was a problem registering the user.');
    }
}

//Login
app.post('/login', function(req, res, next) {
    connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], function(error, results, fields) {
        if (error) {
            return next(error);
        }
        const user = results[0];
        if (user) { //Null is false in js
            if (bcrypt.compareSync(req.body.password, user.password)) {
                const token = signToken(user.id)
                    res.json({ token: token }); //Success
            } else {
                res.status(401).json({ message: 'Invalid credentials.' });
            }
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    });
});

//Signup
app.post('/signup', function(req, res , next) {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    console.log(password);
    if (!validator.isEmail(email)) {
        console.log("invalid email");
        return res.status(400).send('Invalid email format.');
    }
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            console.log("0")
            connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], function (error, results, fields) {
                console.log("1")
                if (error) {
                    return next(error);
                    console.log("2")
                }
                console.log("3")
                const token = signToken(results.insertId);
                res.status(200).send({auth: true, token: token});
            });
        });
    });
});

app.get('/verify-token', passport.authenticate('jwt', { session: false }), function(req, res) {
    // If we get here, the JWT is valid, so we just respond with a success message
    res.json({ message: 'Token is valid.' });
});

//Start server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});