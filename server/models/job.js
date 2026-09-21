const { pool } = require("../config/db");

async function createJob({ title, description, company, location, salary, vacancies, type, reviewMode, postedBy }) {
  const { rows } = await pool.query(
    `INSERT INTO jobs (title, description, company, location, salary, vacancies, type, review_mode, posted_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id AS "_id", title, description, company, location, salary, vacancies, type,
               review_mode AS "reviewMode", is_open AS "isOpen",
               posted_by AS "postedBy", created_at AS "createdAt", updated_at AS "updatedAt"`,
    [title, description, company, location, salary || null, vacancies || 1, type || "part-time", reviewMode || "auto", postedBy]
  );
  const job = rows[0];
  if (job.salary !== null) job.salary = Number(job.salary);
  return job;
}

// Public job list — only jobs the employer has left open.
// Mirrors the old Job.find().populate("postedBy", "name email") behavior.
async function getAllJobs() {
  const { rows } = await pool.query(
    `SELECT j.id AS "_id", j.title, j.description, j.company, j.location, j.salary,
            j.vacancies, j.type, j.review_mode AS "reviewMode",
            j.created_at AS "createdAt", j.updated_at AS "updatedAt",
            u.id AS "postedById", u.name AS "postedByName", u.email AS "postedByEmail"
     FROM jobs j
     LEFT JOIN users u ON j.posted_by = u.id
     WHERE j.is_open = true
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
    reviewMode: r.reviewMode,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    postedBy: r.postedById
      ? { _id: r.postedById, name: r.postedByName, email: r.postedByEmail }
      : null
  }));
}

// Employer's own jobs (open AND closed), with applicant counts —
// powers the "My Jobs" dashboard.
async function getJobsForEmployer(employerId) {
  const { rows } = await pool.query(
    `SELECT j.id AS "_id", j.title, j.description, j.company, j.location, j.salary,
            j.vacancies, j.type, j.review_mode AS "reviewMode", j.is_open AS "isOpen",
            j.created_at AS "createdAt",
            COUNT(a.id)::int AS "applicantCount",
            COUNT(a.id) FILTER (WHERE a.status IN ('assigned', 'accepted'))::int AS "filledCount"
     FROM jobs j
     LEFT JOIN applications a ON a.job_id = j.id
     WHERE j.posted_by = $1
     GROUP BY j.id
     ORDER BY j.created_at DESC`,
    [employerId]
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
    reviewMode: r.reviewMode,
    isOpen: r.isOpen,
    createdAt: r.createdAt,
    applicantCount: r.applicantCount,
    filledCount: r.filledCount
  }));
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id AS "_id", title, description, company, location, salary, vacancies, type,
            review_mode AS "reviewMode", is_open AS "isOpen",
            posted_by AS "postedBy", created_at AS "createdAt"
     FROM jobs WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

// Only fields present in `fields` are changed; ownership is checked by the caller.
async function updateJob(id, fields) {
  const allowed = ["title", "description", "company", "location", "salary", "vacancies", "type", "review_mode"];
  const columnMap = { reviewMode: "review_mode" };

  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    const column = columnMap[key] || key;
    if (!allowed.includes(column) || value === undefined) continue;
    setClauses.push(`${column} = $${i}`);
    values.push(value);
    i++;
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE jobs SET ${setClauses.join(", ")}
     WHERE id = $${i}
     RETURNING id AS "_id", title, description, company, location, salary, vacancies, type,
               review_mode AS "reviewMode", is_open AS "isOpen", posted_by AS "postedBy"`,
    values
  );
  const job = rows[0] || null;
  if (job && job.salary !== null) job.salary = Number(job.salary);
  return job;
}

async function setOpenStatus(id, isOpen) {
  const { rows } = await pool.query(
    `UPDATE jobs SET is_open = $1, updated_at = now()
     WHERE id = $2
     RETURNING id AS "_id", is_open AS "isOpen"`,
    [isOpen, id]
  );
  return rows[0] || null;
}

async function deleteJob(id) {
  // ON DELETE CASCADE on applications.job_id means this also removes
  // every application tied to this job.
  const { rowCount } = await pool.query(`DELETE FROM jobs WHERE id = $1`, [id]);
  return rowCount > 0;
}

module.exports = {
  createJob,
  getAllJobs,
  getJobsForEmployer,
  findById,
  updateJob,
  setOpenStatus,
  deleteJob
};
