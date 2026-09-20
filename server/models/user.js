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

module.exports = { findByEmail, findById, createUser };
