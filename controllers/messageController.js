
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./chatting.db');


// Create messages table if not exists
db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
)`, (err) => {
    if (err) {
        console.error('Error creating messages table:', err.message);
    } else {
        console.log('Messages table created successfully.');
    }
});


// Function to send a message
function sendMessage(req, res) {
    const { senderUsername, receiverUsername, content } = req.body;

    // Check if both sender and receiver exist
    db.get('SELECT id FROM users WHERE username = ?', [senderUsername], (err, sender) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found.' });
        }

        db.get('SELECT id FROM users WHERE username = ?', [receiverUsername], (err, receiver) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error.' });
            }
            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found.' });
            }

            // Insert the message into the database
            db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
                [sender.id, receiver.id, content],
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Internal server error.' });
                    }
                    res.json({ message: 'Message sent successfully.' });
                }
            );
        });
    });
}
function fetchReceivedMessages(req, res) {
    const { username } = req.query;

    // Check if username is provided
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    // Retrieve the user ID for the provided username
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            // Handle the database error
            return res.status(500).json({ message: 'Internal server error.' });
        }
        
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Retrieve messages received by the user from the database
        db.all('SELECT * FROM messages WHERE receiver_id = ?', [user.id], (err, rows) => {
            if (err) {
                // Handle the database error
                return res.status(500).json({ message: 'Internal server error.' });
            }
            // Send the retrieved messages as JSON response
            res.json(rows);
        });
    });
}



module.exports = {
    sendMessage,fetchReceivedMessages
};

