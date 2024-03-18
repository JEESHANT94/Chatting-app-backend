const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(64).toString('hex');
const { register, login } = require('./controllers/authController');
const { sendMessage } = require('./controllers/messageController');
const {fetchReceivedMessages}= require('./controllers/messageController');


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to SQLite database
const db = new sqlite3.Database('./chatting.db');



// Middleware
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
  }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());


// Passport serializeUser and deserializeUser functions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    done(err, row);
  });
});





  
// Register endpoint
app.post('/register', register);

// Login endpoint
app.post('/login', login);

// for message 
app.post('/send-message', sendMessage);

// API end point to fetch received messages for a user
app.get('/messages', fetchReceivedMessages);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
