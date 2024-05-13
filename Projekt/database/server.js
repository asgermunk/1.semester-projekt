const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./queries');
const port = process.env.PORT || 4000;
const cors = require('cors');

require('dotenv').config();

app.use(cors());
app.use(bodyParser.json()); 
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
});


app.get('/Alldata', db.getAlldata);
app.post('/insert-Alldata', db.insertAlldata);
app.post('/populateAlldata', db.populateAlldata);


app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});