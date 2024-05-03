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

app.get('/#', db.get#);
app.post('/insert#', db.insert#);
app.post('/populate#', db.populate#);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});