// This file sets up an Express server and defines RESTful API endpoints for users and their notes.

const HTTP_STATUS = {
    OK: 200, // HTTP status for a successful request.
    METHOD_NOT_ALLOWED: 405, // HTTP status for operations not permitted.
};

const express = require('express'); // Import the Express framework to create the server.

const app = express(); // Initialize the Express application.
const port = 3000; // Set the server to listen on port 3000.

// User endpoints

app.get('/users', (req, res) => {
    // GET /users: Retrieve all users.
    res.status(HTTP_STATUS.OK).json({ message: 'Get all users' });
});

app.get('/users/:userId', (req, res) => {
    // GET /users/:userId: Retrieve a specific user by userId.
    res.status(HTTP_STATUS.OK).json({
        message: 'Get user with id ' + req.params.userId,
    });
});

app.post('/users', (req, res) => {
    // POST /users: Create a new user.
    res.status(HTTP_STATUS.OK).json({ message: 'Post a new user' });
});

app.put('/users/:userId', (req, res) => {
    // PUT /users/:userId: Replace the entire user resource with new data.
    res.status(HTTP_STATUS.OK).json({
        message: 'Update user with id ' + req.params.userId,
    });
});

app.patch('/users/:userId', (req, res) => {
    // PATCH /users/:userId: Update parts of an existing user resource.
    res.status(HTTP_STATUS.OK).json({
        message: 'Partially update user with id ' + req.params.userId,
    });
});

app.delete('/users', (req, res) => {
    // DELETE /users: Delete all users.
    res.status(HTTP_STATUS.OK).json({ message: 'Delete all users' });
});

app.delete('/users/:userId', (req, res) => {
    // DELETE /users/:userId: Delete a specific user by userId.
    res.status(HTTP_STATUS.OK).json({
        message: 'Delete user with id ' + req.params.userId,
    });
});

// Note endpoints

app.get('/users/:userId/notes', (req, res) => {
    // GET /users/:userId/notes: Retrieve all notes for a specific user.
    res.status(HTTP_STATUS.OK).json({
        message: 'Get all notes for user with id ' + req.params.userId,
    });
});

app.get('/users/:userId/notes/:noteId', (req, res) => {
    // GET /users/:userId/notes/:noteId: Retrieve a specific note for a specific user.
    res.status(HTTP_STATUS.OK).json({
        message:
            'Get note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

app.post('/users/:userId/notes', (req, res) => {
    // POST /users/:userId/notes: Create a new note for a specific user.
    res.status(HTTP_STATUS.OK).json({
        message: 'Post a new note for user with id ' + req.params.userId,
    });
});

app.put('/users/:userId/notes/:noteId', (req, res) => {
    // PUT /users/:userId/notes/:noteId: Replace an entire note for a specific user.
    res.status(HTTP_STATUS.OK).json({
        message:
            'Update note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

app.delete('/users/:userId/notes/:noteId', (req, res) => {
    // DELETE /users/:userId/notes/:noteId: Delete a specific note for a specific user.
    res.status(HTTP_STATUS.OK).json({
        message:
            'Delete note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

app.delete('/users/:userId/notes', (req, res) => {
    // DELETE /users/:userId/notes: Delete all notes for a specific user.
    res.status(HTTP_STATUS.OK).json({
        message: 'Delete all notes for user with id ' + req.params.userId,
    });
});

app.get('/notes', (req, res) => {
    // GET /notes: Retrieve all notes regardless of user.
    res.status(HTTP_STATUS.OK).json({ message: 'Get all notes' });
});

// Default route: Catch-all for unsupported operations
app.use('*', (req, res) => {
    // For any route that does not match, respond with "Method Not Allowed".
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// Start the Express server and listen on the defined port.
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
