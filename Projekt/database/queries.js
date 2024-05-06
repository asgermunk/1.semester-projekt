const { Pool } = require("pg");
require("dotenv").config();
const csvtojson = require("csvtojson");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

//route for /energyProduction
const getenergyProduction = (request, response) => {
    pool.query("SELECT * FROM energyProduction_tmp", (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };


  //route for /insert-energyProduction
  const insertenergyProduction = (request, response) => {
    const { land, totalEnergyProduction } = request.body;
    pool.query(
      `INSERT INTO energyProduction_tmp (land, totalEnergyProduction) VALUES ($1, $2)`,
      [land, totalEnergyProduction],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(201).send(`Energy added`);
      }
    );
  };

  //route for /populateEnergyProduction
const populateEnergyProduction = (request, response) => {
const energydata = "cleaned_energy_production.csv";
    const options = {
        delimiter: ';'
      };

    csvtojson().fromFile(energydata, options).then(source => {
        //Fetching the data from each row
        //and inserting to the table food_tmp
        for (var i = 0; i < source.length; i++) {
            //let fields = source[i]["land;totalEnergyProduction"].split(";");
            var land = source[i]["land"];
            var totalEnergyProduction = source[i]["total energy production (kwh)"];
            //TODO: fortsæt med de andre kolonner

            let insertStatement = `INSERT INTO energyProduction_tmp (land, totalEnergyProduction) VALUES ($1, $2)`;
            let items = [
                land,
                totalEnergyProduction
            ];
            
    
            //TODO: her skal laves to variabler: insertStatement og items. 
            //insertStatement skal bestå af sådan som du vil indsætte data i food_tmp tabellen, men med 
            //placeholders $1, $2 osv i stedet for værdier
            //items er en array med de variabler der er blevet defineret ud fra vores data lige ovenover
    
            //Inserting data of current row into database
            pool.query(insertStatement, items, (err, results, fields) => {
                if (err) {
                    console.log("Unable to insert item at row " + i+1);
                    return console.log(err);
                }
            });
        }
        response.status(201).send('All energy added');
    })
  }

module.exports = {
  getenergyProduction, 
  insertenergyProduction,
  populateEnergyProduction,
};


/*
const getByContinent = (request, response) => {
    const continent = request.params.continent;
  
    pool.query('SELECT * FROM your_table WHERE continent = $1', [continent], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
// Insert missing info for get and post to Postman and Neon*/