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
    console.error("Database connection failed:");
    console.error("  message:", error.message || "(empty)");
    console.error("  code:", error.code || "(none)");
    if (error.errors) {
      error.errors.forEach((e, i) => console.error(`  cause[${i}]:`, e.message, e.code));
    }
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
