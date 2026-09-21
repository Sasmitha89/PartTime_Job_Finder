const { createClient } = require("@supabase/supabase-js");

// This is a SEPARATE connection from config/db.js (which talks to Postgres
// directly). This one talks to Supabase's Storage API using the service
// role key, which bypasses Row Level Security — so it must only ever be
// used from the backend, never sent to the frontend.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RESUME_BUCKET = "resumes";

module.exports = { supabase, RESUME_BUCKET };
