const { Pool } = require('pg');
require('dotenv').config();

// Connects to PostgreSQL using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
