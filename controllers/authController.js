const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./chatting.db');
// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  )`);

function register(req, res) {
    const { username, password } = req.body;

  // Check if username already exists
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (row) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user into the database
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error.' });
      }
      res.json({ message: 'User registered successfully.' });
    });
  });
  }
  function login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Incorrect username or password.' });
        }
        // If authentication is successful, manually log in the user
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error.' });
            }
            return res.json({ message: 'Login successful.' });
        });
    })(req, res, next);
}


  module.exports = { register, login };