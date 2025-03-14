// Various settings for the RESTful API using express.js + node.js
const express = require('express');

// Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

// Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

const apiPath = '/api/';
const version = 'v1';
const port = 3000;

const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    CREATED: 201,
};

// Apply middleware to parse JSON in incoming requests.
app.use(bodyParser.json()); // Parses JSON-formatted request bodies

// Enable CORS to let the API respond to requests from different origins.
app.use(cors()); // Activates Cross-Origin Resource Sharing

// Set custom HTTP headers (CORS headers) to further allow cross-origin requests.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow any domain to access this API
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    ); // Specify permitted request headers
    next(); // Proceed to the next middleware function in the stack
});

// Define an array of destination objects with details.
const destinations = [
    {
        id: 1,
        country: 'Italy',
        knownFor: 'Rich history, art, and cuisine',
        bestTime: 'April to June, September to October',
    },
    {
        id: 2,
        country: 'Japan',
        knownFor: 'Cherry blossoms, traditional and modern culture',
        bestTime: 'March to May, October to November',
    },
]; // List of destinations available in this API

// Define an array of attraction objects with details.
const attractions = [
    {
        id: 1,
        destinationId: 1,
        name: 'Colosseum',
        type: 'Historical Site',
        description: 'Iconic ancient Roman gladiatorial arena.',
        visitDuration: '2-3 hours',
    },
    {
        id: 2,
        destinationId: 1,
        name: 'Venice Canals',
        type: 'Cultural Experience',
        description: 'Famous canals and romantic gondola rides.',
        visitDuration: '1 day',
    },
    {
        id: 3,
        destinationId: 2,
        name: 'Mount Fuji',
        type: 'Natural Landmark',
        description: "Japan's tallest mountain and iconic symbol.",
        visitDuration: 'Full day',
    },
    {
        id: 4,
        destinationId: 2,
        name: 'Tokyo Tower',
        type: 'Observation Deck',
        description: 'Offers panoramic views of Tokyo.',
        visitDuration: '1-2 hours',
    },
]; // List of attractions associated with destinations

/* YOUR CODE STARTS HERE */
let nextAttractionId = 5; // Tracker for the next unique attraction ID
let nextDestinationId = 3; // Tracker for the next unique destination ID

/* Read all Destinations
Requirement: Retrieves a list of all destinations, including 
              all details for each destination.
Description: Sends back an array of all destination objects.
URL: http://localhost:3000/api/v1/destinations
Method: GET
Input: None
Output: 
      An array of destination objects.
      Example:
      [
        {
          "id": 1,
          "country": "Italy",
          "knownFor": "Rich history, art, and cuisine",
          "bestTime": "April to June, September to October"
        },
        {
          "id": 2,
          "country": "Japan",
          "knownFor": "Cherry blossoms, traditional and modern culture",
          "bestTime": "March to May, October to November"
        }
      ] */
app.get(apiPath + version + '/destinations', (req, res) => {
    res.status(HTTP_STATUS.OK).json(destinations);
});

/* Read all attractions 
Requirement: Retrieves a list of all attractions, including 
             all details for each attraction. 
Description: Sends back an array of all attraction objects.
URL: http://localhost:3000/api/v1/attractions
Method: GET
Input: None
Output: 
      An array of attraction objects.
      Example:
      [
        {
          "id": 1,
          "destinationId": 1,
          "name": "Colosseum",
          "type": "Historical Site",
          "description": "Iconic ancient Roman gladiatorial arena.",
          "visitDuration": "2-3 hours"
        },
        {
          "id": 2,
          "destinationId": 1,
          "name": "Venice Canals",
          "type": "Cultural Experience",
          "description": "Famous canals and romantic gondola rides.",
          "visitDuration": "1 day"
        }
      ] */
app.get(apiPath + version + '/attractions', (req, res) => {
    res.status(HTTP_STATUS.OK).json(attractions);
});

/* Create a new attraction 
Requirement: Creation of a new attraction with all details. 
Description: Creates and adds a new attraction linked to a given destination.
URL: http://localhost:3000/api/v1/destinations/:destinationId/attractions
Method: POST
Input: 
      Body: object containing information of all attributes of the
            new attraction (excluding id and destinationId). 
      Url parameter: destinationId
      Example Input:
      {
        "name": "Leaning Tower of Pisa",
        "type": "Historical Landmark",
        "description": "Famous leaning bell tower in Pisa, Italy.",
        "visitDuration": "1-2 hours"
      }
Output: 
      The newly created attraction object with id.
      Example Output:
      {
        "id": 5,
        "destinationId": 1,
        "name": "Leaning Tower of Pisa",
        "type": "Historical Landmark",
        "description": "Famous leaning bell tower in Pisa, Italy.",
        "visitDuration": "1-2 hours"
      } */
app.post(
    apiPath + version + '/destinations/:destinationId/attractions',
    (req, res) => {
        // Destructure required properties from the request body.
        const { name, type, description, visitDuration } = req.body;
        // Convert the destinationId from URL parameter to a number.
        const destinationId = Number(req.params.destinationId);
        // Validate that the destinationId is a valid number.
        if (isNaN(destinationId)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Invalid destinationId, it must be a number.',
            });
        }

        // Check to ensure the specified destination exists.
        const destinationIndex = destinations.findIndex(
            (destination) => destination.id === destinationId,
        );
        if (destinationIndex < 0) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: `Destination with id ${destinationId} does not exist.`,
            });
        }

        // Validate that all required fields in the request body exist and are strings.
        if (
            !name ||
            typeof name !== 'string' ||
            !type ||
            typeof type !== 'string' ||
            !description ||
            typeof description !== 'string' ||
            !visitDuration ||
            typeof visitDuration !== 'string'
        ) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                message:
                    'Body should include name, type, description, visitDuration all as strings',
            });
        }

        // Create a new attraction object using the provided and validated data.
        const newAttraction = {
            id: nextAttractionId,
            destinationId,
            name,
            type,
            description,
            visitDuration,
        };
        attractions.push(newAttraction); // Add the new attraction into the attractions array.
        nextAttractionId++; // Increment to maintain unique IDs.

        // Respond with the newly created attraction and HTTP status 201 (Created).
        res.status(HTTP_STATUS.CREATED).json(newAttraction);
    },
);

/*NOTE: Never hand in anything like the following, but this could be helpful 
in development to detecting issues with your endpoints*/
console.log('----------------------------');
console.log('All available endpoints are:');
console.log('----------------------------');
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        // Only include routes
        console.log(
            Object.keys(middleware.route.methods)
                .map((key) => key.toUpperCase())
                .join(', ') +
                ' ' +
                middleware.route.path,
        );
    }
});
console.log('----------------------------');

/* YOUR CODE ENDS HERE */

/* DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) */
if (process.env.NODE_ENV !== 'test') {
    // Begin listening on the specified port.
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

module.exports = app; // Export the Express app for testing or other external uses.
