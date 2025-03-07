const express = require('express');

const app = express();
const port = 3000;

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    METHOD_NOT_ALLOWED: 405,
};

//User endpoints
app.get('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json({ message: 'Get all users' });
});

app.get('/users/:userId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Get user with id ' + req.params.userId,
    });
});

app.post('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json({ message: 'Post a new user' });
});

app.put('/users/:userId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Update user with id ' + req.params.userId,
    });
});

app.patch('/users/:userId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Partially update user with id ' + req.params.userId,
    });
});

app.delete('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json({ message: 'Delete all users' });
});

app.delete('/users/:userId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Delete user with id ' + req.params.userId,
    });
});

//Note endpoints
app.get('/users/:userId/notes', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Get all notes for user with id ' + req.params.userId,
    });
});

app.get('/users/:userId/notes/:noteId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message:
            'Get note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

app.post('/users/:userId/notes', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Post a new note for user with id ' + req.params.userId,
    });
});

app.put('/users/:userId/notes/:noteId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message:
            'Update note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

app.delete('/users/:userId/notes/:noteId', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message:
            'Delete note with id ' +
            req.params.noteId +
            ' for user with id ' +
            req.params.userId,
    });
});

app.delete('/users/:userId/notes', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        message: 'Delete all notes for user with id ' + req.params.userId,
    });
});

app.get('/notes', (req, res) => {
    res.status(HTTP_STATUS.OK).json({ message: 'Get all notes' });
});

//Default: Not supported
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
