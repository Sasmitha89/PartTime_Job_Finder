const { pool } = require("../config/db");

async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, email, password, role, skills, location,
            created_at AS "createdAt"
     FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, skills, location,
            created_at AS "createdAt"
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, password, role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at AS "createdAt"`,
    [name, email, password, role || "jobseeker"]
  );
  return rows[0];
}

async function getProfile(id) {
  const { rows } = await pool.query(
    `SELECT id AS "_id", name, email, role, skills, location, bio, resume_path AS "resumePath",
            created_at AS "createdAt"
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function updateProfile(id, { skills, bio, location }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET skills = COALESCE($1, skills),
         bio = COALESCE($2, bio),
         location = COALESCE($3, location),
         updated_at = now()
     WHERE id = $4
     RETURNING id AS "_id", name, email, role, skills, location, bio,
               resume_path AS "resumePath"`,
    [skills || null, bio ?? null, location ?? null, id]
  );
  return rows[0] || null;
}

async function setResumePath(id, resumePath) {
  const { rows } = await pool.query(
    `UPDATE users SET resume_path = $1, updated_at = now()
     WHERE id = $2
     RETURNING id AS "_id", resume_path AS "resumePath"`,
    [resumePath, id]
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findById, createUser, getProfile, updateProfile, setResumePath };
