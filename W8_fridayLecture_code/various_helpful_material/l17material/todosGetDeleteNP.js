const express = require('express');

const app = express();
const port = 3000;

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
};

let users = [
    { id: 5, username: 'Alice', age: 31 },
    { id: 10, username: 'Bob', age: 31 },
];

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

//User endpoints
app.get('/users', (req, res) => {
    res.status(HTTP_STATUS.OK).json(users);
});

app.get('/users/:userId', (req, res) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == req.params.userId) {
            return res.status(HTTP_STATUS.OK).json(users[i]);
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
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
    var returnArray = users.slice();
    users = [];
    res.status(HTTP_STATUS.OK).json(returnArray);
});

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

//Note endpoints
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

app.get('/users/:userId/notes/:noteId', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            for (let j = 0; j < notes[i].userNotes.length; j++) {
                if (notes[i].userNotes[j].id == req.params.noteId) {
                    res.status(HTTP_STATUS.OK).json(notes[i].userNotes[j]);
                    return;
                }
            }
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
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
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
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

app.delete('/users/:userId/notes', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            var returnArray = notes[i].userNotes.slice();
            notes[i].userNotes = [];
            res.status(HTTP_STATUS.OK).json(returnArray);
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist',
    });
});

app.get('/notes', (req, res) => {
    let allNotes = [];
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    res.status(HTTP_STATUS.OK).json(allNotes);
});

//Default: Not supported
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
