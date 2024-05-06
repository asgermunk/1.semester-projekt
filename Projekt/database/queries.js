const { Pool } = require("pg");
require("dotenv").config();
const csvtojson = require("csvojson");
const { request, response } = require("express");

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})
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