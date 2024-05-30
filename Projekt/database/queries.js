// Importing the necesseray modules
const { Pool } = require("pg"); // PostgreSQL client pool
require("dotenv").config(); // Loads environment variables from a .env file into process.env
const csvtojson = require("csvtojson"); // Converts CSV data to JSON

// Create a new connection pool to the PostgrgeSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


// Function to handle requests to the /getAlldata route
const getAlldata = (request, response) => {
  // Execute a SQL query to get all rows from the Country table
  pool.query("SELECT * FROM Country", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// Function to handle requests to the /insertAlldata route
const insertAlldata = (request, response) => {
  // Extract the data from the request body
  const { Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, Solarproductionterawatthoursyear } = request.body;
  // Execute a SQL query to insert a new row into the Country table
  pool.query(
    `INSERT INTO Country (Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, Solarproductionterawatthoursyear) VALUES ($1, $2, $3, $4, $5)`,
    [Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, Solarproductionterawatthoursyear ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Data added: ${results.insertId}`);
    }
  );
};

// Function to handle requests to the /populateAlldata route
const populateAlldata = (request, response) => {
const Alldata = "Alldata.csv";
  const options = {
      delimiter: ';'
    };
    // Convert the CSV file to JSON
    csvtojson(options).fromFile(Alldata).then(source => {
      // Loop through each row in the CSV file
      source.forEach(row => {
        // Get the values from each columns and if there is a value missing, set it to null
        const Country = row['Country'] || null;
        const CountryAreaKm2 = row['Country Area(Km2)'] || null;
        const SunPotentialKwhYearM2 = row['kwh/yearprm2'] || null;
        const EnergyProductionKwhYear = row['total energy production (kwh) year'] || null;
        const Solarproductionterawatthoursyear = row['Solar production terawatt hours year'] || null;

  
        // Execute a SQL query to insert a new row into the Country table
        pool.query(
          `INSERT INTO Country (Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, Solarproductionterawatthoursyear) VALUES ($1, $2, $3, $4, $5)`,
          [Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, Solarproductionterawatthoursyear ],
          (error, results) => {
            if (error) {
              console.error("Error:", error);
            }
          }
        );
      });
      //Send a response indicating that all data has been inserted into the database
      response.status(201).send('All data inserted into database');
    }).catch(error => {
      // If there is an error, send an error response
      console.error("Error:", error);
      response.status(500).send('Error fetching data from CSV file');
    });
  }   

  // Export the functions to be used in other files
  module.exports = {
  getAlldata,
  insertAlldata,
  populateAlldata
};


