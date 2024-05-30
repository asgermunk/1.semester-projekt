// Importing the necessary modules
const express = require('express'); //Express.js for server and routing
const app = express(); // Create an Express.js app
const bodyParser = require('body-parser'); // Body parser middleware for handling request bodies
const db = require('./queries');  // Import the queries.js file
const port = process.env.PORT || 4000; // Port the server will run on
const cors = require('cors'); // Middleware to enable CORS
const path = require('path'); // Node.js module for working with file and directory paths

// Load environment variables from .env file
require('dotenv').config();

//Use CORS middleware to allow cross-origin requests
app.use(cors());

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json()); 

// Use body-parser middleware to parse URL encoded requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

/* app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
}); */

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Define a route handler for GET requests to the root path
app.get('/', (request, response) => {
  // Send the index.html file as a response
    response.sendFile(path.join(__dirname, '..', '/index.html'));
});

// Define route handlers for the /Alldata, /insert-Alldata, and /populateAlldata routes
app.get('/Alldata', db.getAlldata);
app.post('/insert-Alldata', db.insertAlldata);
app.post('/populateAlldata', db.populateAlldata);

// Start the server on the specified port
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});