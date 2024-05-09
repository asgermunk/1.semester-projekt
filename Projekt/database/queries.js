const { Pool } = require("pg");
require("dotenv").config();
const csvtojson = require("csvtojson");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

//cleaned_energy_production.csv
//route for /energyProduction
const getenergyProduction = (request, response) => {
    pool.query("SELECT * FROM energyProduction_tmp", (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  };

  //cleaned_energy_production.csv
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

  //cleaned_energy_production.csv
  //route for /populateEnergyProduction
const populateEnergyProduction = (request, response) => {
const energydata = "cleaned_energy_production.csv";
    const options = {
        delimiter: ';'
      };

      csvtojson(options).fromFile(energydata).then(source => {
        // Loop igennem hver række i CSV-dataene
        source.forEach(row => {
          // Hent værdierne fra kolonne A og B
          const land = row['land'];
          const totalEnergyProduction = row['total energy production (kwh)'];
    
          // Indsæt data i databasen
          pool.query(
            `INSERT INTO energyProduction_tmp (land, totalEnergyProduction) VALUES ($1, $2)`,
            [land, totalEnergyProduction],
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

//cleaned_potential_solar_energy.csv
//route for /potentialSolarEnergy
const getenergyPotential = (request, response) => {
  pool.query("SELECT * FROM potentialEnergy_tmp", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//cleaned_potential_solar_energy.csv
//route for /insert-energyPotential
const insertenergyPotential = (request, response) => {
  const { land, kwhyear } = request.body;
  pool.query(
    `INSERT INTO potentialEnergy_tmp (land, kwhyear) VALUES ($1, $2)`,
    [land, kwhyear],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Energy added`);
    }
  );
};

//cleaned_potential_solar_energy.csv
//route for /populateEnergyPotential
const populateEnergyPotential = (request, response) => {
const solardata = "cleaned_potential_solar_energy.csv";
  const options = {
      delimiter: ';'
    };

    csvtojson(options).fromFile(solardata).then(source => {
      // Loop igennem hver række i CSV-dataene
      source.forEach(row => {
        // Hent værdierne fra kolonne A og B
        const land = row['land'];
        const kwhyear = row['kwh/year'];
  
        // Add all data to the database
        pool.query(
          `INSERT INTO potentialEnergy_tmp (land, kwhyear) VALUES ($1, $2)`,
          [land, kwhyear],
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

//land_area.csv
//route for /landArea
const getlandArea = (request, response) => {
  pool.query("SELECT * FROM landAreal_tmp", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//land_area.csv
//route for /insert-landArea
const insertlandArea = (request, response) => {
  const { land, landAreakm2 } = request.body;
  pool.query(
    `INSERT INTO landAreal_tmp (land, landAreakm2) VALUES ($1, $2)`,
    [land, landAreakm2],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Area added`);
    }
  );
};

//land_area.csv
//route for /populatelLandArea
const populateLandArea = (request, response) => {
const areadata = "land_area.csv";
  const options = {
      delimiter: ';'
    };

    csvtojson(options).fromFile(areadata).then(source => {
      // Loop igennem hver række i CSV-dataene
      source.forEach(row => {
        // Hent værdierne fra kolonne A og B
        const land = row['Country'];
        const landareakm2 = row['Land Area(Km2)'];
  
        // Add all data to the database
        pool.query(
          `INSERT INTO landAreal_tmp (land, landAreakm2) VALUES ($1, $2)`,
          [land, landareakm2],
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

//cleaned_solar_energy.csv
//route for /getSolarEnergy
const getSolarEnergy = (request, response) => {
  pool.query("SELECT * FROM solarenergy_tmp", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//cleaned_solar_energy.csv
//route for /insert-SolarEnergy
const insertSolarEnergy= (request, response) => {
  const { land, petajoule } = request.body;
  pool.query(
    `INSERT INTO solarenergy_tmp (land, petajoule) VALUES ($1, $2)`,
    [land, petajoule],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Energy added`);
    }
  );
};

//cleaned_solar_energy.csv
//route for /populateSolarEnergy
const populateSolarEnergy = (request, response) => {
const sundata = "cleaned_solar_energy.csv";
  const options = {
      delimiter: ';'
    };

    csvtojson(options).fromFile(sundata).then(source => {
      // Loop igennem hver række i CSV-dataene
      source.forEach(row => {
        // Hent værdierne fra kolonne A og B
        const land = row['Land'];
        const petajoule = row['Petajoule'];
  
        // Add all data to the database
        pool.query(
          `INSERT INTO solarenergy_tmp (land, petajoule) VALUES ($1, $2)`,
          [land, petajoule],
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
      response.status(201).send(`All data added: ${results.insertId}`);
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
  getenergyProduction, 
  insertenergyProduction,
  populateEnergyProduction,
  getenergyPotential,
  insertenergyPotential,
  populateEnergyPotential,
  getlandArea,
  insertlandArea,
  populateLandArea,
  getSolarEnergy,
  insertSolarEnergy,
  populateSolarEnergy,
  getAlldata,
  insertAlldata,
  populateAlldata
};


