// This file implements a RESTful API using Express.
// It supports endpoints to manage users and their notes.

const HTTP_STATUS = {
    OK: 200, // Standard success status code.
    CREATED: 201, // Indicates successful resource creation.
    BAD_REQUEST: 400, // The request does not have the required fields.
    NOT_FOUND: 404, // Requested resource could not be found.
    METHOD_NOT_ALLOWED: 405, // HTTP method is not allowed for the endpoint.
};

const express = require('express'); // Import Express framework for building the server.
const bodyParser = require('body-parser'); // Import middleware to parse JSON bodies.

const app = express(); // Create an Express app instance.
const port = process.env.PORT || 3000; // Define the port for the server to listen on.

app.use(bodyParser.json()); // Use middleware to automatically parse JSON request bodies.

let nextId = 11; // Initialize next available id for new users.
let users = [
    { id: 5, username: 'Alice', age: 25 }, // Predefined user Alice.
    { id: 10, username: 'Bob', age: 30 }, // Predefined user Bob.
];
const notes = [
    {
        userId: 5, // Notes for user with id 5.
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
        userId: 10, // Notes for user with id 10.
        userNotes: [{ id: 1, name: 'shopping list', content: 'Milk, Cheese' }],
    },
];

// Logging middleware: logs each incoming request and adds a custom header.
app.use(function (req, res, next) {
    console.log(
        'Request: ' + req.method + ' at ' + req.url + ', time: ' + new Date(),
    );
    res.set('X-Logged', 'true'); // Mark the response to indicate logging.
    next(); // Continue processing the request.
});

// ------- User endpoints -------

// GET /users - Returns a list of all users.
app.get('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json(users);
});

// GET /users/:userId - Retrieves a user by id.
app.get('/users/:userId', (req, res) => {
    // Loop over users to find a match with the id from the request parameters.
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            // User found; return the user data.
            res.status(HTTP_STATUS.OK).json(users[i]);
            return;
        }
    }
    // If not found, return a 404 error.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// POST /users - Creates a new user.
app.post('/users', (req, res) => {
    // Validate that the request body contains both username and age.
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        // Missing required fields: respond with an error.
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        // Create the new user object and add it to the users array.
        const newUser = {
            username: req.body.username,
            age: req.body.age,
            id: nextId,
        };
        users.push(newUser);
        nextId++; // Update next available id.
        res.status(HTTP_STATUS.CREATED).json(newUser); // Respond with the newly created user.
    }
});

// PUT /users/:userId - Fully updates an existing user.
app.put('/users/:userId', (req, res) => {
    // Validate proper fields are present in the request body.
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        // Find the user and replace the username and age.
        for (let i = 0; i < users.length; i++) {
            if (users[i].id == req.params.userId) {
                users[i].username = req.body.username;
                users[i].age = req.body.age;
                res.status(HTTP_STATUS.OK).json(users[i]);
                return;
            }
        }
        // If no matching user is found, return an error.
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
});

// PATCH /users/:userId - Partially updates an existing user.
app.patch('/users/:userId', (req, res) => {
    if (
        req.body === undefined ||
        (req.body.username === undefined && req.body.age === undefined)
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Either username or age field is required in the request body',
        });
    }
    const user = users.find((u) => u.id == req.params.userId);
    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
    if (req.body.username !== undefined) {
        user.username = req.body.username;
    }
    if (req.body.age !== undefined) {
        user.age = req.body.age;
    }
    return res.status(HTTP_STATUS.OK).json(user);
});

// DELETE /users - Deletes all users and returns the deleted list.
app.delete('/users', (req, res) => {
    const returnArray = users.slice(); // Create a copy to return
    users = []; // Remove all users.
    res.status(HTTP_STATUS.OK).json(returnArray);
});

// DELETE /users/:userId - Deletes a specific user.
app.delete('/users/:userId', (req, res) => {
    // Loop to find the user to delete.
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            // Remove and return the deleted user.
            res.status(HTTP_STATUS.OK).json(users.splice(i, 1));
            return;
        }
    }
    // User not found; return error.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// ------- Note endpoints -------

// GET /users/:userId/notes - Returns all the notes for a specified user.
app.get('/users/:userId/notes', (req, res) => {
    // Search through notes for the user id.
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(notes[i].userNotes);
            return;
        }
    }
    // If user notes are not found, return error.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + 'does not exist.',
    });
});

// GET /users/:userId/notes/:noteId - Returns a specific note of a user.
app.get('/users/:userId/notes/:noteId', (req, res) => {
    const userNotesEntry = notes.find((n) => n.userId == req.params.userId);
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

// POST /users/:userId/notes - Creates a note for a specific user (not fully implemented).
app.post('/users/:userId/notes', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Post a new note for user with id ' + req.params.userId,
    });
});

// PUT /users/:userId/notes/:noteId - Updates a note for a user (not fully implemented).
app.put('/users/:userId/notes/:noteId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message:
            'Update note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

// DELETE /users/:userId/notes/:noteId - Deletes a specific note of a user.
app.delete('/users/:userId/notes/:noteId', (req, res) => {
    const userNotesEntry = notes.find((n) => n.userId == req.params.userId);
    if (!userNotesEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    const noteIndex = userNotesEntry.userNotes.findIndex(
        (n) => n.id == req.params.noteId,
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
    const deletedNote = userNotesEntry.userNotes.splice(noteIndex, 1);
    return res.status(HTTP_STATUS.OK).json(deletedNote);
});

// DELETE /users/:userId/notes - Deletes all notes for a specific user.
app.delete('/users/:userId/notes', (req, res) => {
    // Find the user's notes.
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            const returnArray = notes[i].userNotes.slice(); // Copy current notes.
            notes[i].userNotes = []; // Remove all notes.
            res.status(HTTP_STATUS.OK).json(returnArray);
            return;
        }
    }
    // No notes found for the specified user.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// GET /notes - Returns a list of all notes from all users.
app.get('/notes', (req, res) => {
    let allNotes = [];
    // Merge notes from all users into one array.
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    res.status(HTTP_STATUS.OK).json(allNotes);
});

// Default endpoint: handles routes or HTTP methods not explicitly defined.
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// Start the server and listen on the specified port.
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
