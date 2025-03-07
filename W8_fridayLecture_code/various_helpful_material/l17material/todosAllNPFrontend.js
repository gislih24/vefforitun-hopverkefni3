const express = require('express');
var path = require('path');

const app = express();
const port = 3000;

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');
//Tell express to use the body parser module
app.use(bodyParser.json());

var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
};

let nextId = 11;
let nextNoteId = 13;
let users = [
    { id: 5, username: 'Alice', age: 25 },
    { id: 10, username: 'Bob', age: 30 },
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
            res.status(HTTP_STATUS.OK).json(users[i]);
            return;
        }
    }
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User with id ' + req.params.userId + ' does not exist.',
    });
});

app.post('/users', (req, res) => {
    if (req.body === undefined || req.body.username === undefined || req.body.age === undefined) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'username and age fields are required in the request body',
        });
    } else {
        let newUser = {
            username: req.body.username,
            age: req.body.age,
            id: nextId,
        };
        users.push(newUser);
        let newNotes = { userId: nextId, userNotes: [] };
        notes.push(newNotes);
        nextId++;
        res.status(HTTP_STATUS.CREATED).json(newUser);
    }
});

app.put('/users/:userId', (req, res) => {
    if (req.body === undefined || req.body.username === undefined || req.body.age === undefined) {
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

app.patch('/users/:userId', (req, res) => {
    if (req.body === undefined || (req.body.username === undefined && req.body.age === undefined)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'Either username or age field is required in the request body',
        });
    } else {
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
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist.',
        });
    }
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
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User with id ' + req.params.userId + 'does not exist.' });
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
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User with id ' + req.params.userId + ' does not exist' });
});

app.post('/users/:userId/notes', (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.content === undefined) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    } else {
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
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
});

app.put('/users/:userId/notes/:noteId', (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.content === undefined) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: 'name and content fields are required in the request body',
        });
    } else {
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].userId == req.params.userId) {
                for (let j = 0; j < notes[i].userNotes.length; j++) {
                    if (notes[i].userNotes[j].id == req.params.noteId) {
                        notes[i].userNotes[j].name = req.body.name;
                        notes[i].userNotes[j].content = req.body.content;
                        res.status(HTTP_STATUS.CREATED).json(notes[i].userNotes[j]);
                        return;
                    }
                }
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    message: 'Note with id ' + req.params.noteId + ' does not exist',
                });
                return;
            }
        }
        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: 'User with id ' + req.params.userId + ' does not exist',
        });
    }
});

app.delete('/users/:userId/notes/:noteId', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].userId == req.params.userId) {
            for (let j = 0; j < notes[i].userNotes.length; j++) {
                if (notes[i].userNotes[j].id == req.params.noteId) {
                    res.status(HTTP_STATUS.OK).json(notes[i].userNotes.splice(j, 1));
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
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User with id ' + req.params.userId + ' does not exist' });
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
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User with id ' + req.params.userId + ' does not exist' });
});

app.get('/notes', (req, res) => {
    let allNotes = [];
    for (let i = 0; i < notes.length; i++) {
        allNotes = allNotes.concat(notes[i].userNotes);
    }
    res.status(HTTP_STATUS.OK).json(allNotes);
});

app.get('/frontend', (req, res) => {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/frontend.html');
});

//Default: Not supported
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
