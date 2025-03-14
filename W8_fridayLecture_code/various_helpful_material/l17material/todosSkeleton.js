// Define an object for common HTTP status codes to improve code readability.
const HTTP_STATUS = {
    OK: 200, // 200 indicates a successful request.
    METHOD_NOT_ALLOWED: 405, // 405 indicates the HTTP method is not allowed.
};

// Import the Express module to create the server.
const express = require('express');

// Initialize an Express application.
const app = express();

// Define the port number the server will listen on.
const port = 3000;

// Define a GET route for the root path ('/').
// When a GET request is made to '/', send a 'Hello World!' message with an OK status.
app.get('/', (req, res) => {
    res.status(HTTP_STATUS.OK).send('Hello World!');
});

// Define a catch-all route for any paths not previously defined.
// This ensures that unsupported operations return a METHOD_NOT_ALLOWED status.
app.use('*', (req, res) => {
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).send('Operation not supported.');
});

// Start the Express server and log a message to the console when it's ready.
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
