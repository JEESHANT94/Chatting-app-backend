const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();

passport.use(new LocalStrategy((username, password, done) => {
  // Check if user exists in SQLite database and verify password
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return done(err);
    }
    if (!row) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (row.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, row);
  });
}));
