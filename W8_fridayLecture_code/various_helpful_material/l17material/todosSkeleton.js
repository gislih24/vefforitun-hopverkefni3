const express = require('express');

const app = express();
const port = 3000;

const HTTP_STATUS = {
    OK: 200,
    METHOD_NOT_ALLOWED: 405,
};

app.get('/', (req, res) => {
    res.status(HTTP_STATUS.OK).send('Hello World!');
});

app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
