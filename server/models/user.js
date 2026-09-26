const { pool } = require("../config/db");

async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, email, password, role, skills, location, is_admin AS "isAdmin",
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
            verification_status AS "verificationStatus", verification_note AS "verificationNote",
            created_at AS "createdAt"
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function requestVerification(id, note) {
  const { rows } = await pool.query(
    `UPDATE users
     SET verification_status = 'pending', verification_note = $1, updated_at = now()
     WHERE id = $2
     RETURNING id AS "_id", verification_status AS "verificationStatus", verification_note AS "verificationNote"`,
    [note || null, id]
  );
  return rows[0] || null;
}

// ---------- Admin-only ----------
async function getEmployersForAdmin() {
  const { rows } = await pool.query(
    `SELECT id AS "_id", name, email, verification_status AS "verificationStatus",
            verification_note AS "verificationNote", created_at AS "createdAt"
     FROM users
     WHERE role = 'employer'
     ORDER BY
       CASE verification_status WHEN 'pending' THEN 0 ELSE 1 END,
       created_at DESC`
  );
  return rows;
}

async function setVerificationStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE users SET verification_status = $1, updated_at = now()
     WHERE id = $2 AND role = 'employer'
     RETURNING id AS "_id", name, email, verification_status AS "verificationStatus"`,
    [status, id]
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

module.exports = {
  findByEmail,
  findById,
  createUser,
  getProfile,
  updateProfile,
  setResumePath,
  requestVerification,
  getEmployersForAdmin,
  setVerificationStatus
};
