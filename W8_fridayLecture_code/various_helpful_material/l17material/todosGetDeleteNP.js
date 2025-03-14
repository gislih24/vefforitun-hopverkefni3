// This file sets up an Express server with RESTful endpoints for handling "users" and their "notes"

// Import the Express framework for creating the server
const express = require('express');

// Define HTTP status codes for standard responses
const HTTP_STATUS = {
    OK: 200, // Request succeeded
    NOT_FOUND: 404, // Resource not found
    METHOD_NOT_ALLOWED: 405, // HTTP method not supported
};

// Create an Express application instance
const app = express();
// Define the port number for the server to listen on
const port = 3000;

// Sample data: list of user objects with id, username, and age
let users = [
    { id: 5, username: 'Alice', age: 31 },
    { id: 10, username: 'Bob', age: 31 },
];

// Sample data: list of notes associated with users. Each object links a userId to an array of notes.
const notes = [
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

// =============== User endpoints ===============

// GET /users: Retrieve all users
app.get('/users', (req, res) => {
    // Send the complete users array with a 200 OK status
    res.status(HTTP_STATUS.OK).json(users);
});

// GET /users/:userId: Retrieve a specific user by id
app.get('/users/:userId', (req, res) => {
    // Loop through the users array to find a matching id
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            // Return the found user with a 200 OK status
            return res.status(HTTP_STATUS.OK).json(users[i]);
        }
    }
    // If user is not found, return a 404 error with a message
    return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// POST /users: Create a new user (sample, not implemented)
app.post('/users', (req, res) => {
    // Acknowledge receipt of a POST request for adding a new user
    res.status(HTTP_STATUS.OK).json({ message: 'Post a new user' });
});

// PUT /users/:userId: Update (replace) an existing user by id
app.put('/users/:userId', (req, res) => {
    // Acknowledge full update of the specified user
    res.status(HTTP_STATUS.OK).json({
        message: 'Update user with id ' + req.params.userId,
    });
});

// PATCH /users/:userId: Partially update an existing user by id
app.patch('/users/:userId', (req, res) => {
    // Acknowledge partial update of the specified user fields
    res.status(HTTP_STATUS.OK).json({
        message: 'Partially update user with id ' + req.params.userId,
    });
});

// DELETE /users: Delete all users
app.delete('/users', (req, res) => {
    // Copy the current users to return them after deletion
    const returnArray = users.slice();
    // Clear the users array
    users = [];
    // Return the list of deleted users with a 200 OK status
    res.status(HTTP_STATUS.OK).json(returnArray);
});

// DELETE /users/:userId: Delete a specific user by id
app.delete('/users/:userId', (req, res) => {
    // Loop through users to locate the user with the specified id
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            // Remove and return the deleted user data with a 200 OK status
            res.status(HTTP_STATUS.OK).json(users.splice(i, 1));
            return;
        }
    }
    // If the user wasn't found, return a 404 error with descriptive message
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// =============== Note endpoints ===============

// GET /users/:userId/notes: Retrieve all notes for a given user
app.get('/users/:userId/notes', (req, res) => {
    // Locate the notes for the matching user id
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            // Return the user's notes with a 200 OK status
            res.status(HTTP_STATUS.OK).json(notes[i].userNotes);
            return;
        }
    }
    // If no notes are found for the user, respond with a 404 error
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

// GET /users/:userId/notes/:noteId: Retrieve a specific note for a specific user
app.get('/users/:userId/notes/:noteId', (req, res) => {
    // Use array.find to locate the notes for the specified user
    const userNotesEntry = notes.find(
        (item) => item.userId == req.params.userId,
    );

    if (!userNotesEntry) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }

    // Use array.find to locate the note within the user's notes
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

    // Return the found note with a 200 OK status
    return res.status(HTTP_STATUS.OK).json(note);
});

// POST /users/:userId/notes: Create a new note for a specified user (sample, not implemented)
app.post('/users/:userId/notes', (req, res) => {
    // Acknowledge the new note creation request
    res.status(HTTP_STATUS.OK).json({
        message: 'Post a new note for user with id ' + req.params.userId,
    });
});

// PUT /users/:userId/notes/:noteId: Update (replace) an existing note for a user
app.put('/users/:userId/notes/:noteId', (req, res) => {
    // Acknowledge update of the specified note with a message
    res.status(HTTP_STATUS.OK).json({
        message:
            'Update note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

// DELETE /users/:userId/notes/:noteId: Delete a specific note for a specified user
app.delete('/users/:userId/notes/:noteId', (req, res) => {
    const userNotesEntry = notes.find(
        (item) => item.userId == req.params.userId,
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

// DELETE /users/:userId/notes: Delete all notes for a given user
app.delete('/users/:userId/notes', (req, res) => {
    // Find the user's note collection
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            // Copy userNotes to return them and then clear the array
            const returnArray = notes[i].userNotes.slice();
            notes[i].userNotes = [];
            // Return the deleted notes with a 200 OK status
            res.status(HTTP_STATUS.OK).json(returnArray);
            return;
        }
    }
    // If the specified user is not found, send a 404 error message
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

// GET /notes: Retrieve all notes across all users
app.get('/notes', (req, res) => {
    let allNotes = [];
    // Concatenate every user's notes into a single list
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    // Return the aggregated notes with a 200 OK status
    res.status(HTTP_STATUS.OK).json(allNotes);
});

// Default route: Handles any unsupported request method or route
app.use('*', (req, res) => {
    // Respond with a 405 status (Method Not Allowed)
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// Start the server and listen on the defined port
app.listen(port, () => {
    // Log a message on the console to indicate the server is running
    console.log('Express app listening on port ' + port);
});
