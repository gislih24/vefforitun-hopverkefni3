// Import the required modules: express for creating the server, body-parser for parsing JSON request bodies
const express = require('express');
const bodyParser = require('body-parser');

// Define HTTP status codes for readability
const HTTP_STATUS = {
    OK: 200, // Standard success response code
    CREATED: 201, // Resource creation successful
    BAD_REQUEST: 400, // Client sent an invalid request
    NOT_FOUND: 404, // Resource not found
    METHOD_NOT_ALLOWED: 405, // HTTP method not allowed on this route
};

// Create an instance of the Express app and set the server port
const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware to process JSON request bodies
app.use(bodyParser.json());

// Initialize counters and sample data for users and corresponding notes
let nextId = 11; // Next available user ID
let nextNoteId = 13; // Next available note ID
// Array with sample users, each represented by an object with id, username, and age
let users = [
    { id: 5, username: 'Alice', age: 25 },
    { id: 10, username: 'Bob', age: 30 },
];
// Array with users' notes grouped by userId
const notes = [
    {
        userId: 5, // Notes for user with id 5 (Alice)
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
        userId: 10, // Notes for user with id 10 (Bob)
        userNotes: [{ id: 1, name: 'shopping list', content: 'Milk, Cheese' }],
    },
];

// --------------------
// User endpoints
// --------------------

// GET /users : Retrieve the complete list of users.
app.get('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json(users);
});

// GET /users/:userId : Retrieve a specific user based on the provided userId.
app.get('/users/:userId', (req, res) => {
    // Loop through the users and return the one that matches req.params.userId
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(users[i]);
            return;
        }
    }
    // If no user is found, send a NOT_FOUND response with an error message.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// POST /users : Create a new user. Requires username and age in the request body.
app.post('/users', (req, res) => {
    // Validate that both username and age are provided.
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        // Create new user object and push to the users array.
        const newUser = {
            username: req.body.username,
            age: req.body.age,
            id: nextId,
        };
        users.push(newUser);
        // Create an empty notes container for the new user.
        const newNotes = { userId: nextId, userNotes: [] };
        notes.push(newNotes);
        nextId++;
        res.status(HTTP_STATUS.CREATED).json(newUser);
    }
});

// PUT /users/:userId : Replace a user's details completely. Requires both username and age.
app.put('/users/:userId', (req, res) => {
    // Validate the request body.
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        // Find and update the user if exists.
        for (let i = 0; i < users.length; i++) {
            if (users[i].id == req.params.userId) {
                users[i].username = req.body.username;
                users[i].age = req.body.age;
                res.status(HTTP_STATUS.OK).json(users[i]);
                return;
            }
        }
        // If user is not found, return a NOT_FOUND response.
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
});

// PATCH /users/:userId : Partially update a user's details. Requires at least one of username or age.
app.patch('/users/:userId', (req, res) => {
    // Ensure that at least one field is provided.
    if (
        !req.body ||
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

// DELETE /users : Delete all users and return the deleted list.
app.delete('/users', (req, res) => {
    const returnArray = users.slice(); // Copy the existing users.
    users = []; // Clear the users array.
    res.status(HTTP_STATUS.OK).json(returnArray);
});

// DELETE /users/:userId : Delete a specific user.
app.delete('/users/:userId', (req, res) => {
    // Find the user that matches and remove it.
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(users.splice(i, 1));
            return;
        }
    }
    // If no match, return a NOT_FOUND error.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// --------------------
// Note endpoints
// --------------------

// GET /users/:userId/notes : Retrieve all notes for a specified user.
app.get('/users/:userId/notes', (req, res) => {
    // Match the userId in the notes array.
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(notes[i].userNotes);
            return;
        }
    }
    // Return error if user not found.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// GET /users/:userId/notes/:noteId : Retrieve a particular note for a specified user.
app.get('/users/:userId/notes/:noteId', (req, res) => {
    const userEntry = notes.find((entry) => entry.userId == req.params.userId);
    if (!userEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    const note = userEntry.userNotes.find((n) => n.id == req.params.noteId);
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

// POST /users/:userId/notes : Create a new note for a specific user.
app.post('/users/:userId/notes', (req, res) => {
    // Validate that both note name and content are provided.
    if (
        req.body === undefined ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    } else {
        // Locate the user's notes and add the new note.
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].userId == req.params.userId) {
                const newNote = {
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
        // Return error if user is not found.
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
});

// PUT /users/:userId/notes/:noteId : Update an existing note for a user.
app.put('/users/:userId/notes/:noteId', (req, res) => {
    // Validate that both name and content are provided in the request.
    if (
        !req.body ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    }

    // Locate the user's notes using Array.find.
    const userNotesEntry = notes.find(
        (entry) => entry.userId == req.params.userId,
    );
    if (!userNotesEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }

    // Locate the note to update using Array.find.
    const note = userNotesEntry.userNotes.find(
        (n) => n.id == req.params.noteId,
    );
    if (!note) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'Note with id ' + req.params.noteId + ' does not exist',
        });
    }

    // Update the note's name and content.
    note.name = req.body.name;
    note.content = req.body.content;
    return res.status(HTTP_STATUS.CREATED).json(note);
});

// DELETE /users/:userId/notes/:noteId : Delete a specific note for a given user.
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

// DELETE /users/:userId/notes : Delete all notes for a specific user.
app.delete('/users/:userId/notes', (req, res) => {
    // Locate the user in the notes array.
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            const returnArray = notes[i].userNotes.slice(); // Copy existing notes.
            notes[i].userNotes = []; // Clear the notes for this user.
            res.status(HTTP_STATUS.OK).json(returnArray);
            return;
        }
    }
    // If user is not found.
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// GET /notes : Retrieve a list of all notes for all users.
app.get('/notes', (req, res) => {
    let allNotes = [];
    // Concatenate the notes from all users.
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    res.status(HTTP_STATUS.OK).json(allNotes);
});

// --------------------
// Default route handler
// --------------------

// This catch-all route handles any undefined endpoints by returning a METHOD_NOT_ALLOWED error.
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// --------------------
// Start the server
// --------------------

// Launch the Express server and listen on the configured port.
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
