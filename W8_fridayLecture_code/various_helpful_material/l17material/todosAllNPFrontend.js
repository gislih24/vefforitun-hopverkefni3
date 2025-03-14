// Import Express for creating the web server and Path for handling file paths.
const express = require('express');
const path = require('path');

// Create an instance of an Express application.
const app = express();
// Define the port on which the server will listen.
const port = 3000;

// Define an object with common HTTP status codes.
const HTTP_STATUS = {
    OK: 200, // Standard response for successful HTTP requests.
    CREATED: 201, // Indicates that a resource was successfully created.
    BAD_REQUEST: 400, // The server could not understand the request.
    NOT_FOUND: 404, // The requested resource was not found.
    METHOD_NOT_ALLOWED: 405, // The request method is known by the server but is not supported.
};

// Import the body-parser module to parse incoming JSON data.
const bodyParser = require('body-parser');
// Tell Express to use the body-parser middleware for JSON parsing.
app.use(bodyParser.json());

// Normalize the root directory and set up static file serving from the 'client' folder.
const root = path.normalize(__dirname + '/..'); // Determine the parent directory.
app.use(express.static(path.join(root, 'client'))); // Serve static files from 'client'.
app.set('appPath', 'client'); // Set the application path for static files.

// Define initial unique IDs and sample data for users.
let nextId = 11; // Next available user id.
let nextNoteId = 13; // Next available note id.
let users = [
    { id: 5, username: 'Alice', age: 25 }, // Sample user: Alice.
    { id: 10, username: 'Bob', age: 30 }, // Sample user: Bob.
];

// Define sample notes for users.
const notes = [
    {
        userId: 5, // Notes for user with id 5.
        userNotes: [
            { id: 10, name: 'todos for today', content: 'Prepare Lab 6' }, // Note for Alice.
            {
                id: 12,
                name: 'memo for l15',
                content: 'Do not forget to mention Heroku',
            }, // Additional note.
        ],
    },
    {
        userId: 10, // Notes for user with id 10.
        userNotes: [{ id: 1, name: 'shopping list', content: 'Milk, Cheese' }], // Note for Bob.
    },
];

// User endpoints

// GET /users - Retrieve and return all users.
app.get('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json(users);
});

// GET /users/:userId - Retrieve a specific user by id.
app.get('/users/:userId', (req, res) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(users[i]);
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// POST /users - Create a new user using provided "username" and "age" fields.
app.post('/users', (req, res) => {
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        const newUser = {
            username: req.body.username,
            age: req.body.age,
            id: nextId,
        };
        users.push(newUser);
        const newNotes = { userId: nextId, userNotes: [] };
        notes.push(newNotes);
        nextId++;
        res.status(HTTP_STATUS.CREATED).json(newUser);
    }
});

// PUT /users/:userId - Replace an existing user entirely with new "username" and "age".
app.put('/users/:userId', (req, res) => {
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.age === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        for (let i = 0; i < users.length; i++) {
            if (users[i].id == req.params.userId) {
                users[i].username = req.body.username;
                users[i].age = req.body.age;
                res.status(HTTP_STATUS.OK).json(users[i]);
                return;
            }
        }
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
});

// PATCH /users/:userId - Partially update the user (either "username" or "age" can be updated).
app.patch('/users/:userId', (req, res) => {
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
    if (user) {
        if (req.body.username !== undefined) {
            user.username = req.body.username;
        }
        if (req.body.age !== undefined) {
            user.age = req.body.age;
        }
        return res.status(HTTP_STATUS.OK).json(user);
    }
    return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// DELETE /users - Delete all users and return the deleted list.
app.delete('/users', (req, res) => {
    const returnArray = users.slice();
    users = [];
    res.status(HTTP_STATUS.OK).json(returnArray);
});

// DELETE /users/:userId - Delete a specific user by id.
app.delete('/users/:userId', (req, res) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(users.splice(i, 1));
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// Note endpoints

// GET /users/:userId/notes - Retrieve all notes for the specified user.
app.get('/users/:userId/notes', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            res.status(HTTP_STATUS.OK).json(notes[i].userNotes);
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + 'does not exist.',
    });
});

// GET /users/:userId/notes/:noteId - Retrieve a specific note for a user.
app.get('/users/:userId/notes/:noteId', (req, res) => {
    const userNotesObj = notes.find((n) => n.userId == req.params.userId);
    if (!userNotesObj) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    const note = userNotesObj.userNotes.find((n) => n.id == req.params.noteId);
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

// POST /users/:userId/notes - Create a new note for a specified user.
app.post('/users/:userId/notes', (req, res) => {
    if (
        req.body === undefined ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    } else {
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
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
});

// PUT /users/:userId/notes/:noteId - Replace an entire note with new data.
app.put('/users/:userId/notes/:noteId', (req, res) => {
    if (
        req.body === undefined ||
        req.body.name === undefined ||
        req.body.content === undefined
    ) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    }
    const userNotesObj = notes.find((n) => n.userId == req.params.userId);
    if (!userNotesObj) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    const note = userNotesObj.userNotes.find((n) => n.id == req.params.noteId);
    if (!note) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'Note with id ' + req.params.noteId + ' does not exist',
        });
    }
    note.name = req.body.name;
    note.content = req.body.content;
    return res.status(HTTP_STATUS.CREATED).json(note);
});

// DELETE /users/:userId/notes/:noteId - Delete a specific note from a user's notes.
app.delete('/users/:userId/notes/:noteId', (req, res) => {
    const userNotesObj = notes.find((n) => n.userId == req.params.userId);
    if (!userNotesObj) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
    const noteIndex = userNotesObj.userNotes.findIndex(
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
    const removedNote = userNotesObj.userNotes.splice(noteIndex, 1);
    return res.status(HTTP_STATUS.OK).json(removedNote);
});

// DELETE /users/:userId/notes - Delete all notes for a specified user.
app.delete('/users/:userId/notes', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            const returnArray = notes[i].userNotes.slice();
            notes[i].userNotes = [];
            res.status(HTTP_STATUS.OK).json(returnArray);
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// GET /notes - Retrieve and return all notes from all users.
app.get('/notes', (req, res) => {
    let allNotes = [];
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    res.status(HTTP_STATUS.OK).json(allNotes);
});

// GET /frontend - Serve the frontend HTML file.
app.get('/frontend', (req, res) => {
    const relativeAppPath = req.app.get('appPath');
    const absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/frontend.html');
});

// Default route: any non-supported operation returns 405 METHOD NOT ALLOWED.
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// Start the Express server and listen on the designated port.
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
