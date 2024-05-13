const { Pool } = require("pg");
require("dotenv").config();
const csvtojson = require("csvtojson");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

//Alldata.csv
//route for /getAlldata
const getAlldata = (request, response) => {
  pool.query("SELECT * FROM Country", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//Alldata.csv
// route for /insert-alldata  
const insertAlldata = (request, response) => {
  const { Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, EnergySunProductionYearPJ } = request.body;
  pool.query(
    `INSERT INTO Country (Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, EnergySunProductionYearPJ) VALUES ($1, $2, $3, $4, $5)`,
    [Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, EnergySunProductionYearPJ ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Data added: ${results.insertId}`);
    }
  );
};

//Alldata.csv
//route for /populatealldata
const populateAlldata = (request, response) => {
const Alldata = "Alldata.csv";
  const options = {
      delimiter: ';'
    };

    csvtojson(options).fromFile(Alldata).then(source => {
      // Loop igennem hver række i CSV-dataene
      source.forEach(row => {
        console.log(row['kwh/yearprm2']);
        // Hent værdierne fra kolonne A, B, C, D og E
        const Country = row['Country'] || null;
        const CountryAreaKm2 = row['Country Area(Km2)'] || null;
        const SunPotentialKwhYearM2 = row['kwh/yearprm2'] || null;
        const EnergyProductionKwhYear = row['total energy production (kwh) year'] || null;
        const EnergySunProductionYearPJ = row['Petajoule'] || null;

  
        // Add all data to the database
        pool.query(
          `INSERT INTO Country (Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, EnergySunProductionYearPJ) VALUES ($1, $2, $3, $4, $5)`,
          [Country, CountryAreaKm2, SunPotentialKwhYearM2, EnergyProductionKwhYear, EnergySunProductionYearPJ ],
          (error, results) => {
            if (error) {
              console.error("Error:", error);
            }
          }
        );
      });
  
      response.status(201).send('All data inserted into database');
    }).catch(error => {
      console.error("Error:", error);
      response.status(500).send('Error fetching data from CSV file');
    });
  }   



  module.exports = {
  getAlldata,
  insertAlldata,
  populateAlldata
};


