const { pool } = require("../config/db");

async function findByJobAndApplicant(jobId, applicantId) {
  const { rows } = await pool.query(
    `SELECT id AS "_id", job_id AS "job", applicant_id AS "applicant", status,
            created_at AS "createdAt"
     FROM applications WHERE job_id = $1 AND applicant_id = $2`,
    [jobId, applicantId]
  );
  return rows[0] || null;
}

async function countAssigned(jobId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM applications WHERE job_id = $1 AND status = 'assigned'`,
    [jobId]
  );
  return rows[0].count;
}

async function createApplication({ jobId, applicantId, status }) {
  const { rows } = await pool.query(
    `INSERT INTO applications (job_id, applicant_id, status)
     VALUES ($1, $2, $3)
     RETURNING id AS "_id", job_id AS "job", applicant_id AS "applicant", status,
               created_at AS "createdAt"`,
    [jobId, applicantId, status]
  );
  return rows[0];
}

// Mirrors the old Application.find().populate("job").populate("applicant", "name email")
async function getAllApplications() {
  const { rows } = await pool.query(
    `SELECT a.id AS "_id", a.status, a.created_at AS "createdAt",
            j.id AS "jobId", j.title AS "jobTitle", j.company AS "jobCompany",
            u.id AS "applicantId", u.name AS "applicantName", u.email AS "applicantEmail"
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     JOIN users u ON a.applicant_id = u.id
     ORDER BY a.created_at DESC`
  );

  return rows.map((r) => ({
    _id: r._id,
    status: r.status,
    createdAt: r.createdAt,
    job: { _id: r.jobId, title: r.jobTitle, company: r.jobCompany },
    applicant: { _id: r.applicantId, name: r.applicantName, email: r.applicantEmail }
  }));
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id AS "_id", job_id AS "job", applicant_id AS "applicant", status
     FROM applications WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE applications SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING id AS "_id", job_id AS "job", applicant_id AS "applicant", status`,
    [status, id]
  );
  return rows[0] || null;
}

module.exports = {
  findByJobAndApplicant,
  countAssigned,
  createApplication,
  getAllApplications,
  findById,
  updateStatus
};
