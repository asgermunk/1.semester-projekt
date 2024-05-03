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

// Insert missing info for get and post to Postman and Neon