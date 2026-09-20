const { pool } = require("../config/db");

async function createJob({ title, description, company, location, salary, vacancies, type, postedBy }) {
  const { rows } = await pool.query(
    `INSERT INTO jobs (title, description, company, location, salary, vacancies, type, posted_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id AS "_id", title, description, company, location, salary, vacancies, type,
               posted_by AS "postedBy", created_at AS "createdAt", updated_at AS "updatedAt"`,
    [title, description, company, location, salary || null, vacancies || 1, type || "part-time", postedBy]
  );
  const job = rows[0];
  if (job.salary !== null) job.salary = Number(job.salary);
  return job;
}

// Mirrors the old Job.find().populate("postedBy", "name email") behavior:
// each job comes back with a nested postedBy: { _id, name, email } object.
async function getAllJobs() {
  const { rows } = await pool.query(
    `SELECT j.id AS "_id", j.title, j.description, j.company, j.location, j.salary,
            j.vacancies, j.type, j.created_at AS "createdAt", j.updated_at AS "updatedAt",
            u.id AS "postedById", u.name AS "postedByName", u.email AS "postedByEmail"
     FROM jobs j
     LEFT JOIN users u ON j.posted_by = u.id
     ORDER BY j.created_at DESC`
  );

  return rows.map((r) => ({
    _id: r._id,
    title: r.title,
    description: r.description,
    company: r.company,
    location: r.location,
    salary: r.salary === null ? undefined : Number(r.salary),
    vacancies: r.vacancies,
    type: r.type,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    postedBy: r.postedById
      ? { _id: r.postedById, name: r.postedByName, email: r.postedByEmail }
      : null
  }));
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id AS "_id", title, description, company, location, salary, vacancies, type,
            posted_by AS "postedBy", created_at AS "createdAt"
     FROM jobs WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { createJob, getAllJobs, findById };
