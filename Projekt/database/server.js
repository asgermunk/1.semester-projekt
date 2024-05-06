const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./queries');
const port = process.env.PORT || 4000;

require('dotenv').config();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/energyProduction', db.get1sem);
app.post('/insert-energyProduction', db.insert1sem);
app.post('/populate#', db.populate1sem);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});