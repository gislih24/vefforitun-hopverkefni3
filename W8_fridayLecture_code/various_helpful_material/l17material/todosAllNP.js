// Import the express framework to create the server
const express = require('express');
// Create an express application instance
const app = express();
// Set the port number for the server to listen on
const port = 3000;

// Import body-parser for parsing JSON request bodies
const bodyParser = require('body-parser');
// Configure express to use body-parser to parse JSON bodies
app.use(bodyParser.json());

// Middleware to add CORS (Cross-Origin Resource Sharing) headers
// Allowing any origin to access the endpoint and specifying allowed headers
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    ); // Allow specific headers
    next(); // Pass control to the next middleware
});

// =====================
// Global HTTP status codes
// =====================
const HTTP_STATUS = {
    OK: 200, // Request succeeded
    CREATED: 201, // Resource created successfully
    BAD_REQUEST: 400, // Request data is invalid
    NOT_FOUND: 404, // Resource was not found
    METHOD_NOT_ALLOWED: 405, // HTTP method not supported for the endpoint
};

// =====================
// Data initialization
// =====================

// Variables to generate unique IDs for users and notes
let nextId = 11;
let nextNoteId = 13;

// Initial array storing user objects
let users = [
    { id: 5, username: 'Alice', age: 25 }, // User record for Alice
    { id: 10, username: 'Bob', age: 30 }, // User record for Bob
];

// Array to store notes corresponding to each user
// Each element contains a userId and an array of note objects
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

// =====================
// User endpoints
// =====================

// GET /users - Retrieve all users
app.get('/users', (req, res) => {
    // Respond with the users array and HTTP status 200
    res.status(HTTP_STATUS.OK).json(users);
});

// GET /users/:userId - Retrieve a specific user by id
app.get('/users/:userId', (req, res) => {
    // Loop over users array to find the user by id (using loose equality)
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            // User found, return user object with HTTP status 200
            res.status(HTTP_STATUS.OK).json(users[i]);
            return;
        }
    }
    // User not found: send a 404 status and error message
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// POST /users - Create a new user (requires username and age)
app.post('/users', (req, res) => {
    // Validate that username and age are provided in the request body
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Username and age fields are required in the request body.',
        });
    }
    // Validate that age is a positive number
    if (isNaN(Number(req.body.age)) || Number(req.body.age) < 0) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: 'Age has to be a positive number.' });
    }
    // Create a new user object with a unique id
    const newUser = {
        username: req.body.username,
        age: req.body.age,
        id: nextId,
    };
    // Add the new user to the users array
    users.push(newUser);
    // Create an empty notes container for the new user
    const newNotes = { userId: nextId, userNotes: [] };
    notes.push(newNotes);
    nextId++; // Increment the user id for the next new user
    // Return the newly created user with HTTP status 201
    return res.status(HTTP_STATUS.CREATED).json(newUser);
});

// PUT /users/:userId - Fully update an existing user's information
app.put('/users/:userId', (req, res) => {
    // Validate that both username and age are provided in the request body
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    }
    // Validate that the provided age is a positive number
    if (isNaN(Number(req.body.age)) || Number(req.body.age) < 0) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: 'Age has to be a positive number.' });
    }
    // Find and update the user in the users array
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            users[i].username = req.body.username;
            users[i].age = req.body.age;
            return res.status(HTTP_STATUS.OK).json(users[i]);
        }
    }
    // If no user is found, return a 404 error
    return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// PATCH /users/:userId - Partially update a user's information
app.patch('/users/:userId', (req, res) => {
    // Ensure at least one field (username or age) is provided in the request body
    if (
        !req.body ||
        (req.body.username === undefined && req.body.age === undefined)
    ) {
        // If neither field is provided, respond with a 400 Bad Request error
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message:
                'Either username or age field is required in the request body',
        });
    }
    // If age is provided, validate that it is a positive number
    if (
        req.body.age !== undefined &&
        (isNaN(Number(req.body.age)) || Number(req.body.age) < 0)
    ) {
        // Respond with a 400 error if the age is invalid
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: 'Age has to be a positive number.' });
    }
    // Locate the user to be updated using Array.find
    const user = users.find((u) => u.id == req.params.userId);
    if (!user) {
        // If no user is found, respond with a 404 Not Found error
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
    // Update username if provided
    if (req.body.username !== undefined) {
        user.username = req.body.username;
    }
    // Update age if provided
    if (req.body.age !== undefined) {
        user.age = req.body.age;
    }
    // Return the updated user with HTTP status 200
    return res.status(HTTP_STATUS.OK).json(user);
});

// DELETE /users - Delete all users
app.delete('/users', (req, res) => {
    const returnArray = users.slice(); // Copy the current users for the response
    users = []; // Clear the users array
    res.status(HTTP_STATUS.OK).json(returnArray); // Return the deleted users
});

// DELETE /users/:userId - Delete a specific user by id
app.delete('/users/:userId', (req, res) => {
    // Loop over the users array to find and remove the matching user
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            // Remove the user and return the removed item(s)
            res.status(HTTP_STATUS.OK).json(users.splice(i, 1));
            return;
        }
    }
    // If user not found, return a 404 error
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// =====================
// Note endpoints
// =====================

// GET /users/:userId/notes - Retrieve all notes for a given user
app.get('/users/:userId/notes', (req, res) => {
    // Loop over the notes array to locate notes for the user
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            // Notes found: return the user's notes array with HTTP status 200
            res.status(HTTP_STATUS.OK).json(notes[i].userNotes);
            return;
        }
    }
    // If no notes container is found for the user, send a 404 error
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// GET /users/:userId/notes/:noteId - Retrieve a specific note for a user
app.get('/users/:userId/notes/:noteId', (req, res) => {
    // Find the user's notes container using Array.find
    const userNotesObj = notes.find((n) => n.userId == req.params.userId);
    if (!userNotesObj) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    // Search for the specific note by note id
    const noteItem = userNotesObj.userNotes.find(
        (note) => note.id == req.params.noteId,
    );
    if (!noteItem) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message:
                'Note with id ' +
                req.params.noteId +
                ' does not exist for user ' +
                req.params.userId,
        });
    }
    // Return the found note with HTTP status 200
    return res.status(HTTP_STATUS.OK).json(noteItem);
});

// POST /users/:userId/notes - Create a new note for a specific user
app.post('/users/:userId/notes', (req, res) => {
    // Validate that the note contains both name and content
    if (
        req.body === undefined ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    } else {
        // Loop through notes array to find the correct user's notes container
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].userId == req.params.userId) {
                // Create a new note object with a unique id
                const newNote = {
                    name: req.body.name,
                    content: req.body.content,
                    id: nextNoteId,
                };
                // Add the new note to the user's note array
                notes[i].userNotes.push(newNote);
                nextNoteId++; // Increment note id for subsequent notes
                // Return the new note with HTTP status 201
                return res.status(HTTP_STATUS.CREATED).json(newNote);
            }
        }
        // If the user's notes container is not found, return a 404 error
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
});

// PUT /users/:userId/notes/:noteId - Fully update a specific note for a user
app.put('/users/:userId/notes/:noteId', (req, res) => {
    // Validate that both name and content fields are provided in the request body
    if (
        req.body === undefined ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    }
    // Locate the user's notes container using Array.find
    const userNotesObj = notes.find((n) => n.userId == req.params.userId);
    if (!userNotesObj) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    // Find the note to be updated within the user's notes array
    const note = userNotesObj.userNotes.find(
        (note) => note.id == req.params.noteId,
    );
    if (!note) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'Note with id ' + req.params.noteId + ' does not exist',
        });
    }
    // Update the note properties with provided values
    note.name = req.body.name;
    note.content = req.body.content;
    // Return the updated note with HTTP status 201
    return res.status(HTTP_STATUS.CREATED).json(note);
});

// DELETE /users/:userId/notes/:noteId - Delete a specific note for a user
app.delete('/users/:userId/notes/:noteId', (req, res) => {
    // Locate the user's notes container
    const userNotesObj = notes.find((n) => n.userId == req.params.userId);
    if (!userNotesObj) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    // Find the index of the note to be deleted
    const noteIndex = userNotesObj.userNotes.findIndex(
        (note) => note.id == req.params.noteId,
    );
    if (noteIndex < 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message:
                'Note with id ' +
                req.params.noteId +
                ' does not exist for user ' +
                req.params.userId,
        });
    }
    // Remove the note from the array and return it with HTTP status 200
    const deletedNote = userNotesObj.userNotes.splice(noteIndex, 1);
    return res.status(HTTP_STATUS.OK).json(deletedNote);
});

// DELETE /users/:userId/notes - Delete all notes for a specific user
app.delete('/users/:userId/notes', (req, res) => {
    // Loop over the notes array to find the user's notes container
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            const returnArray = notes[i].userNotes.slice(); // Copy current notes for return
            notes[i].userNotes = []; // Clear the user's notes
            return res.status(HTTP_STATUS.OK).json(returnArray);
        }
    }
    // If no notes container is found for the user, return a 404 error
    return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// GET /notes - Retrieve all notes across all users
app.get('/notes', (req, res) => {
    let allNotes = [];
    // Aggregate all notes from each user's note container
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    // Return the aggregated list with HTTP status 200
    res.status(HTTP_STATUS.OK).json(allNotes);
});

// =====================
// Default route for unmatched endpoints
// =====================

// Catch-all route for any endpoints not explicitly defined
app.use('*', (req, res) => {
    // Return a 405 Method Not Allowed status and message
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
