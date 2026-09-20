const { Pool } = require("pg");

// Supabase's Postgres requires SSL. rejectUnauthorized:false matches
// Supabase's own connection examples for node-postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSL === "false"
      ? false
      : { rejectUnauthorized: false }
});

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
