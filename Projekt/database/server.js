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

app.get('/energyProduction', db.getenergyProduction);
app.post('/insert-energyProduction', db.insertenergyProduction);
app.post('/populateEnergyProduction', db.populateEnergyProduction);
app.get('/energyPotential', db.getenergyPotential);
app.post('/insert-energyPotential', db.insertenergyPotential);
app.post('/populateEnergyPotential', db.populateEnergyPotential);
app.get('/landArea', db.getlandArea);
app.post('/insert-landArea', db.insertlandArea);
app.post('/populateLandArea', db.populateLandArea);
app.get('/SolarEnergy', db.getSolarEnergy);
app.post('/insert-SolarEnergy', db.insertSolarEnergy);
app.post('/populateSolarEnergy', db.populateSolarEnergy);


app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});