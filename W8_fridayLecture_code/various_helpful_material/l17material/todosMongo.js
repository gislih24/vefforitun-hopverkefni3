// Server Side JavaScript and RESTful API example using Express and MongoDB

// Define HTTP status codes used for API responses
const HTTP_STATUS = {
    OK: 200, // Request succeeded
    CREATED: 201, // Resource has been created
    BAD_REQUEST: 400, // Client sent a bad request
    NOT_FOUND: 404, // Requested resource not found
    INTERNAL_SERVER_ERROR: 500, // Server error occurred
    METHOD_NOT_ALLOWED: 405, // HTTP method not allowed
};

const express = require('express'); // Import the Express framework

// Import body parser to parse JSON in HTTP request bodies
const bodyParser = require('body-parser');

const app = express(); // Create an Express application instance
const port = process.env.PORT || 3000; // Set the port from environment or default to 3000

const mongo = require('mongodb'); // Import MongoDB driver
const MongoClient = mongo.MongoClient;
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/'; // Set the DB URL from environment or local
let db; // Variable to store the database connection

// Initialize MongoDB connection and start Express server once connected
MongoClient.connect(dbUrl, function (err, database) {
    if (err) {
        throw err;
    } // Throw error if connection fails
    db = database.db('todoDB'); // Connect to the 'todoDB' database
    app.listen(port, () => {
        console.log('Express app listening on port ' + port); // Log server startup
    });
});

// Tell Express to use body-parser middleware for JSON parsing
app.use(bodyParser.json());

// In-memory sample data for demonstration purposes:
const nextId = 11; // Next available id for users (if needed)
const users = [
    { id: 5, username: 'Alice', age: 25 }, // Sample user 1
    { id: 10, username: 'Bob', age: 30 }, // Sample user 2
];
const notes = [
    {
        userId: 5, // Notes for user with id 5
        userNotes: [
            { id: 10, name: 'todos for today', content: 'Prepare Lab 6' },
            {
                id: 12,
                name: 'memo for l15',
                content: 'Do not forget to mention Heroku',
            },
        ],
    },
    {
        userId: 10, // Notes for user with id 10
        userNotes: [{ id: 1, name: 'shopping list', content: 'Milk, Cheese' }],
    },
];

// Middleware to log request details and set a custom header
app.use(function (req, res, next) {
    console.log(
        'Request: ' + req.method + ' at ' + req.url + ', time: ' + new Date(),
    ); // Log method, URL, and time
    res.set('X-Logged', 'true'); // Set custom header to indicate logging
    next(); // Pass on to the next middleware/route handler
});

// ---------- User Endpoints ----------

// GET /users - Retrieves all users from the MongoDB 'users' collection
app.get('/users', (req, res) => {
    db.collection('users')
        .find({})
        .toArray(function (err, users) {
            if (err) {
                return res
                    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error when accessing DB.' });
            }
            return res.status(HTTP_STATUS.OK).json(users); // Return all users
        });
});

// GET /users/:userId - Retrieves a single user by MongoDB ObjectID
app.get('/users/:userId', (req, res) => {
    const id = new mongo.ObjectID(req.params.userId); // Convert parameter to MongoDB ObjectID
    db.collection('users').findOne({ _id: id }, function (err, user) {
        if (err || user === null) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message:
                    'User with id ' + req.params.userId + ' does not exist.',
            });
        } else {
            return res.status(HTTP_STATUS.OK).json(user); // Return found user
        }
    });
});

// POST /users - Creates a new user document in the MongoDB 'users' collection
app.post('/users', (req, res) => {
    // Validate the request body contains required fields
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    }
    const newUser = { username: req.body.username, age: req.body.age }; // Build new user object
    return db.collection('users').insertOne(newUser, function (err, user) {
        if (err) {
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error when writing user.' });
        }
        return res.status(HTTP_STATUS.CREATED).json(user.ops[0]); // Return created user object
    });
});

// PUT /users/:userId - Replaces an existing user's username and age in MongoDB
app.put('/users/:userId', (req, res) => {
    // Validate required fields in request body
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        const id = new mongo.ObjectID(req.params.userId); // Convert id to MongoDB ObjectID
        const newValues = {
            $set: { username: req.body.username, age: req.body.age },
        }; // Build update object
        db.collection('users').findOneAndUpdate(
            { _id: id },
            newValues,
            function (err, user) {
                if (err || user === null || user.value === null) {
                    res.status(HTTP_STATUS.NOT_FOUND).json({
                        message:
                            'User with id ' +
                            req.params.userId +
                            ' does not exist.',
                    });
                } else {
                    res.status(HTTP_STATUS.OK).json(user.value); // Return updated user data
                }
            },
        );
    }
});

// PATCH /users/:userId - Partially updates a user's properties in the in-memory array
app.patch('/users/:userId', (req, res) => {
    // Validate at least one property (username or age) is provided
    if (
        req.body === undefined ||
        (req.body.username === undefined && req.body.age === undefined)
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Either username or age field is required in the request body',
        });
    }
    // Update in-memory user record
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            if (req.body.username !== undefined) {
                users[i].username = req.body.username; // Update username
            }
            if (req.body.age !== undefined) {
                users[i].age = req.body.age; // Update age
            }
            return res.status(HTTP_STATUS.OK).json(users[i]); // Return modified user info
        }
    }
    return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// DELETE /users - Deletes all users from the MongoDB 'users' collection
app.delete('/users', (req, res) => {
    // Retrieve all users first because deleteMany does not return the deleted items
    db.collection('users')
        .find({})
        .toArray(function (err, users) {
            db.collection('users').deleteMany({}, function (err, obj) {
                if (err || obj === null || obj.result.ok !== 1) {
                    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        message: 'Deletion failed with error: ' + err,
                    });
                } else {
                    res.status(HTTP_STATUS.OK).json(users); // Return the deleted users list
                }
            });
        });
});

// DELETE /users/:userId - Deletes a single user from MongoDB by ObjectID
app.delete('/users/:userId', (req, res) => {
    const id = new mongo.ObjectID(req.params.userId); // Convert parameter to ObjectID
    db.collection('users').findOneAndDelete({ _id: id }, function (err, obj) {
        if (err || obj === null || obj.value === null) {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message:
                    'User with id ' + req.params.userId + ' does not exist.',
            });
        } else {
            res.status(HTTP_STATUS.OK).json(obj.value); // Return deleted user object
        }
    });
});

// ---------- Note Endpoints ----------

// GET /users/:userId/notes - Retrieves all notes for a specific user from the in-memory array
app.get('/users/:userId/notes', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(notes[i].userNotes); // Return user's notes
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + 'does not exist.',
    });
});

// GET /users/:userId/notes/:noteId - Retrieves a specific note for a user from the in-memory array
app.get('/users/:userId/notes/:noteId', (req, res) => {
    const userNotesEntry = notes.find(
        (entry) => entry.userId == req.params.userId,
    );
    if (!userNotesEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    const note = userNotesEntry.userNotes.find(
        (n) => n.id == req.params.noteId,
    );
    if (!note) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message:
                'Note with id ' +
                req.params.noteId +
                ' does not exist for user ' +
                req.params.userId,
        });
    }
    return res.status(HTTP_STATUS.OK).json(note);
});

// POST /users/:userId/notes - Placeholder to create a new note for a user (implementation can be added)
app.post('/users/:userId/notes', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Post a new note for user with id ' + req.params.userId,
    });
});

// PUT /users/:userId/notes/:noteId - Placeholder to update an existing note (implementation can be added)
app.put('/users/:userId/notes/:noteId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message:
            'Update note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

// DELETE /users/:userId/notes/:noteId - Deletes a specific note for a user from the in-memory array
app.delete('/users/:userId/notes/:noteId', (req, res) => {
    const userNotesEntry = notes.find(
        (entry) => entry.userId == req.params.userId,
    );
    if (!userNotesEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    const noteIndex = userNotesEntry.userNotes.findIndex(
        (note) => note.id == req.params.noteId,
    );
    if (noteIndex === -1) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message:
                'Note with id ' +
                req.params.noteId +
                ' does not exist for user ' +
                req.params.userId,
        });
    }
    const removed = userNotesEntry.userNotes.splice(noteIndex, 1);
    return res.status(HTTP_STATUS.OK).json(removed);
});

// DELETE /users/:userId/notes - Deletes all notes for a given user from the in-memory array
app.delete('/users/:userId/notes', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            const returnArray = notes[i].userNotes.slice(); // Copy current notes for response
            notes[i].userNotes = []; // Clear notes for the user
            res.status(HTTP_STATUS.OK).json(returnArray); // Return deleted notes
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// GET /notes - Retrieves all notes across all users from the in-memory array
app.get('/notes', (req, res) => {
    let allNotes = [];
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes); // Aggregate notes from every user
    }
    res.status(HTTP_STATUS.OK).json(allNotes); // Return all aggregated notes
});

// Default route for undefined endpoints returning Method Not Allowed
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});
