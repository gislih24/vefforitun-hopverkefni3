// Import the express module to create the web server
const express = require('express');

// Create an instance of an Express application
const app = express();
// Define the port the server will listen on
const port = 3000;

// Import the body-parser module to parse incoming JSON requests
const bodyParser = require('body-parser');
// Tell Express to use the body-parser middleware for JSON data
app.use(bodyParser.json());

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
};

// Set headers to allow cross-origin requests
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // Allow any domain to access
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next(); // Proceed to next middleware or route handler
});

// Initialize variables for IDs and example data arrays for users and notes
let nextId = 11;
let nextNoteId = 13;
// Array containing initial user objects with id, username and age
let users = [
    { id: 5, username: 'Alice', age: 25 },
    { id: 10, username: 'Bob', age: 30 },
];
// Array containing notes for the users, each entry links userId to an array of notes
let notes = [
    {
        userId: 5,
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
        userId: 10,
        userNotes: [{ id: 1, name: 'shopping list', content: 'Milk, Cheese' }],
    },
];

// ---------------------- User Endpoints ----------------------

// GET /users - Returns all users in the system
app.get('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json(users);
});

// GET /users/:userId - Returns a single user by user id
app.get('/users/:userId', (req, res) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(users[i]);
            return;
        }
    }
    // If user not found, return 404 error
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// POST /users - Creates a new user with a username and age
app.post('/users', (req, res) => {
    // Check if request body contains required fields
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Username and age fields are required in the request body.',
        });
    } else {
        // Validate that age is a positive number
        if (isNaN(Number(req.body.age)) || Number(req.body.age) < 0) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: 'Age has to be a positive number.' });
        }
        // Create new user object and add it to the users array
        let newUser = {
            username: req.body.username,
            age: req.body.age,
            id: nextId,
        };
        users.push(newUser);
        // Also create an empty notes array for the new user
        let newNotes = { userId: nextId, userNotes: [] };
        notes.push(newNotes);
        nextId++;
        res.status(HTTP_STATUS.CREATED).json(newUser);
    }
});

// PUT /users/:userId - Replaces an existing user entirely
app.put('/users/:userId', (req, res) => {
    // Check if request body has both username and age
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        // Ensure age is a positive number
        if (isNaN(Number(req.body.age)) || Number(req.body.age) < 0) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: 'Age has to be a positive number.' });
        }

        // Search for the user and update the fields
        for (let i = 0; i < users.length; i++) {
            if (users[i].id == req.params.userId) {
                users[i].username = req.body.username;
                users[i].age = req.body.age;
                res.status(HTTP_STATUS.OK).json(users[i]);
                return;
            }
        }
        // Return 404 if user is not found
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
});

// PATCH /users/:userId - Updates parts of an existing user
app.patch('/users/:userId', (req, res) => {
    // Check that at least one field (username or age) is provided
    if (
        req.body === undefined ||
        (req.body.username === undefined && req.body.age === undefined)
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Either username or age field is required in the request body',
        });
    } else {
        // Validate age if provided
        if (
            req.body.age !== undefined &&
            (isNaN(Number(req.body.age)) || Number(req.body.age) < 0)
        ) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: 'Age has to be a positive number.' });
        }

        // Locate the user and update provided fields
        for (let i = 0; i < users.length; i++) {
            if (users[i].id == req.params.userId) {
                if (req.body.username !== undefined) {
                    users[i].username = req.body.username;
                }
                if (req.body.age !== undefined) {
                    users[i].age = req.body.age;
                }
                res.status(HTTP_STATUS.OK).json(users[i]);
                return;
            }
        }
        // If user not found, return 404
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
});

// DELETE /users - Deletes all users and returns the deleted users
app.delete('/users', (req, res) => {
    var returnArray = users.slice();
    users = [];
    res.status(HTTP_STATUS.OK).json(returnArray);
});

// DELETE /users/:userId - Deletes a specific user based on user id
app.delete('/users/:userId', (req, res) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(users.splice(i, 1));
            return;
        }
    }
    // Return 404 if user to delete is not found
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// ---------------------- Note Endpoints ----------------------

// GET /users/:userId/notes - Returns all notes for a specific user
app.get('/users/:userId/notes', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(notes[i].userNotes);
            return;
        }
    }
    // If user not found in notes array, return 404
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + 'does not exist.',
    });
});

// GET /users/:userId/notes/:noteId - Returns a specific note for a specific user
app.get('/users/:userId/notes/:noteId', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            // Loop through user's notes for the specific noteId
            for (let j = 0; j < notes[i].userNotes.length; j++) {
                if (notes[i].userNotes[j].id == req.params.noteId) {
                    res.status(HTTP_STATUS.OK).json(notes[i].userNotes[j]);
                    return;
                }
            }
            // If note not found, send 404 error
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message:
                    'Note with id ' +
                    req.params.noteId +
                    ' does not exist for user ' +
                    req.params.userId,
            });
            return;
        }
    }
    // If user is not found, send 404 error
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// POST /users/:userId/notes - Creates a new note for a specific user
app.post('/users/:userId/notes', (req, res) => {
    // Validate incoming request body has name and content fields
    if (
        req.body === undefined ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    } else {
        // Find the user in notes array and add the new note
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].userId == req.params.userId) {
                let newNote = {
                    name: req.body.name,
                    content: req.body.content,
                    id: nextNoteId,
                };
                notes[i].userNotes.push(newNote);
                nextNoteId++;
                res.status(HTTP_STATUS.CREATED).json(newNote);
                return;
            }
        }
        // If user not found, return 404 error
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
});

// PUT /users/:userId/notes/:noteId - Replaces a note for a specific user
app.put('/users/:userId/notes/:noteId', (req, res) => {
    // Check that both name and content are provided
    if (
        req.body === undefined ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    } else {
        // Locate the user and then the specific note to replace its content
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].userId == req.params.userId) {
                for (let j = 0; j < notes[i].userNotes.length; j++) {
                    if (notes[i].userNotes[j].id == req.params.noteId) {
                        notes[i].userNotes[j].name = req.body.name;
                        notes[i].userNotes[j].content = req.body.content;
                        res.status(HTTP_STATUS.CREATED).json(
                            notes[i].userNotes[j],
                        );
                        return;
                    }
                }
                // If note not found, return 404 error
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    message:
                        'Note with id ' + req.params.noteId + ' does not exist',
                });
                return;
            }
        }
        // If user not found, return 404 error
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
});

// DELETE /users/:userId/notes/:noteId - Deletes a specific note for a specific user
app.delete('/users/:userId/notes/:noteId', (req, res) => {
    // Find the user and then the corresponding note to delete it
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            for (let j = 0; j < notes[i].userNotes.length; j++) {
                if (notes[i].userNotes[j].id == req.params.noteId) {
                    res.status(HTTP_STATUS.OK).json(
                        notes[i].userNotes.splice(j, 1),
                    );
                    return;
                }
            }
            // If note not found under the user, send 404 error
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message:
                    'Note with id ' +
                    req.params.noteId +
                    ' does not exist for user ' +
                    req.params.userId,
            });
            return;
        }
    }
    // If user is not found, send 404 error
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// DELETE /users/:userId/notes - Deletes all notes for a specific user
app.delete('/users/:userId/notes', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            var returnArray = notes[i].userNotes.slice();
            notes[i].userNotes = [];
            res.status(HTTP_STATUS.OK).json(returnArray);
            return;
        }
    }
    // Return 404 if user not found
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// GET /notes - Returns all notes across all users
app.get('/notes', (req, res) => {
    let allNotes = [];
    // Concatenate all notes from each user's notes array
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    res.status(HTTP_STATUS.OK).json(allNotes);
});

// ---------------------- Default Handler ----------------------

// Catch-all for unsupported routes and methods, returns 405 error
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
