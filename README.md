# Shiftly — Part-Time Job Finder

A full-stack job marketplace connecting part-time job seekers with employers — built with Node.js/Express, PostgreSQL (via Supabase), Supabase Storage, and a vanilla JS frontend. Originally built on MongoDB, later migrated to Postgres.

## Features

### For everyone
- 🔐 JWT-based authentication with bcrypt password hashing
- 🎨 Login-first flow: guests land on Login/Register, then get routed straight into the experience for their role
- 🔍 Search, type filter, and sort on the public Jobs page

### For job seekers
- 📝 Apply to jobs (duplicate applications are blocked at both the app and database level)
- ⚡ Two outcomes depending on how the employer set up the job:
  - **Auto-review jobs** — instantly told "Assigned" or "No space left"
  - **Manual-review jobs** — application goes to "Awaiting review" until the employer decides
- 📬 **My Applications** tab — every application's current status in one place, so an outcome is never lost after closing the browser
- 🧑‍💼 **Profile** tab — skills, bio, location, and a PDF resume upload (stored in Supabase Storage, shown to employers via short-lived signed links, never public)

### For employers
- 💼 Post jobs with a title, description, location, salary, job type, and number of positions (vacancies)
- 🎛️ Choose **Auto** or **Manual** review per job at posting time (editable later)
- 📊 **My Jobs** dashboard — every job you've posted (open or closed), with applicant counts and a filled/vacancy ratio
- ✏️ **Edit** any job you posted; **Close/Reopen** a listing without deleting it; **Delete** it permanently (cascades to its applications)
- 🧑‍🤝‍🧑 **Applicants** tab — everyone who applied to *your* jobs specifically (properly scoped — an earlier bug that showed every application platform-wide has been fixed), with their skills, bio, and resume
- ✅ **Accept/Reject** buttons on pending (manual-review) applications — blocked from over-accepting once a job's vacancies are full
- 🏅 **Verification** tab — request a Verified badge; once approved, it shows on all your public job listings

### Admin (lightweight, not a public role)
- A boolean `is_admin` flag on any existing account (set manually via SQL — there's no admin signup)
- **Admin** tab appears automatically for any account with the flag, regardless of whether it's a jobseeker or employer account
- Lists all employers (pending verification requests first) with Verify / Reject / Reset actions

## Tech Stack

**Backend:** Node.js, Express 5, PostgreSQL (via Supabase), JWT, bcrypt, CORS, Multer (file uploads), `@supabase/supabase-js` (Storage only)
**Database & Storage:** Supabase Postgres + Supabase Storage (private `resumes` bucket, accessed only via signed URLs generated server-side)
**Frontend:** Vanilla HTML/CSS/JavaScript, single file, no build step
**CI:** GitHub Actions — installs dependencies, checks syntax, and boots the real server against a Postgres service container as a smoke test on every push/PR

## Project Structure

```
job-finder/
├── Client/
│   ├── index.html          # The entire frontend — open directly in a browser
│   └── assets/             # Illustrations and icons (sign-up art, jobs-page art, verified badge)
├── server/
│   ├── config/
│   │   ├── db.js                # Postgres connection pool
│   │   └── supabaseStorage.js   # Supabase Storage client (service_role key — backend only)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── adminMiddleware.js
│   ├── models/
│   │   ├── user.js
│   │   ├── job.js
│   │   └── application.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── supabase/
│   ├── schema.sql                              # Full schema for a fresh install
│   └── migrations/
│       ├── 001_add_profile_fields.sql          # bio, resume_path on users
│       ├── 002_job_management.sql              # review_mode, is_open on jobs
│       └── 003_employer_verification.sql       # verification_status, is_admin on users
├── .github/workflows/ci.yml
└── .gitignore
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- A free [Supabase](https://supabase.com) account and project

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/job-finder.git
cd job-finder
```

### 2. Set up the database
In Supabase's SQL Editor, run **in order**:
1. `supabase/schema.sql`
2. Each file in `supabase/migrations/`, in numeric order

(If you're setting this up completely fresh, `schema.sql` already includes everything the migrations add — but running the migrations too is harmless, since they all use `IF NOT EXISTS`.)

### 3. Create a Storage bucket
In Supabase → Storage → New bucket → name it exactly `resumes` → leave it **Private**.

### 4. Set up environment variables
```bash
cd server
cp .env.example .env
```
Fill in `.env` with:
```
PORT=5000
DATABASE_URL=postgresql://postgres.xxxx:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres
JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
- `DATABASE_URL` — Supabase dashboard → **Connect** button → Session pooler (use the pooler, not the direct connection — the direct one is IPv6-only and fails on many networks)
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → **Project Settings → API Keys** (use the bare project URL with nothing after `.co`, and the `service_role` key — never the `anon`/`publishable` one)

### 5. Install and run
```bash
npm install
npm run dev
```
You should see `Database connected` and `Server running on port 5000`.

### 5. Open the frontend

Open `Client/index.html` directly in your browser, or use the VS Code "Live Server" extension for auto-reload during development.

> The frontend expects the API at `http://localhost:5000/api`. If you change `PORT` in `.env`, update `API_BASE` at the top of the `<script>` section in `Client/index.html` to match.

## API Reference

### Auth (`/api/auth`)

| Method | Endpoint    | Description                  | Auth required |
|--------|-------------|-------------------------------|----------------|
| POST   | `/register` | Create a new user              | No             |
| POST   | `/login`    | Log in, returns a JWT token     | No             |

### Jobs (`/api/jobs`)
| Method | Endpoint      | Description                                  | Auth                     |
|--------|---------------|------------------------------------------------|----------------------------|
| GET    | `/`           | List all **open** jobs                          | No                       |
| GET    | `/mine`       | Employer's own jobs (open + closed) with counts | employer                |
| POST   | `/`           | Create a job                                    | employer                |
| PUT    | `/:id`        | Edit a job you posted                           | employer, must own it   |
| PATCH  | `/:id/status` | Close/reopen a job                              | employer, must own it   |
| DELETE | `/:id`        | Delete a job (cascades applications)            | employer, must own it   |

### Applications (`/api/applications`)
| Method | Endpoint  | Description                                 | Auth                              |
|--------|-----------|-----------------------------------------------|--------------------------------------|
| POST   | `/:jobId` | Apply to a job                                | jobseeker                          |
| GET    | `/mine`   | Your own applications and their status         | jobseeker                          |
| GET    | `/`       | Applications to jobs **you** posted           | employer                           |
| PUT    | `/:id`    | Accept/reject an application                   | employer, must own the job; blocked if job is full |

### Users / Profile (`/api/users`)
| Method | Endpoint                  | Description                          | Auth                     |
|--------|----------------------------|-----------------------------------------|----------------------------|
| GET    | `/me`                       | Your own profile                        | Yes                      |
| PUT    | `/me`                       | Update skills/bio/location               | Yes                      |
| POST   | `/me/resume`                | Upload/replace your resume (PDF, 5MB max) | jobseeker              |
| GET    | `/:id/resume`               | Signed URL to view a resume              | owner, or an employer   |
| POST   | `/me/request-verification`  | Request employer verification            | employer                |

### Admin (`/api/admin`)
| Method | Endpoint                        | Description                                | Auth        |
|--------|----------------------------------|-----------------------------------------------|---------------|
| GET    | `/employers`                     | List employers, pending requests first        | admin       |
| PATCH  | `/employers/:id/verification`    | Set an employer's verification status          | admin       |

All authenticated requests need an `Authorization: Bearer <token>` header.

## Security Notes
- Never commit your `.env` — it's already in `.gitignore`. Use `.env.example` as the template.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — it must only ever live in `server/.env`, never in frontend code or a committed file.
- If a real secret was ever accidentally committed, rotate it (Supabase lets you reset the DB password and regenerate keys from the dashboard) — old commits keep the leaked value even after the file is fixed going forward.
- Resumes are stored in a **private** Storage bucket and only ever served via short-lived signed URLs generated server-side — never a public/permanent link.

## What's Not Built Yet
A few ideas that came up but haven't been implemented:
- Password reset ("forgot password" via email)
- Server-side search/pagination for the Jobs list (currently client-side, fine at small scale)
- Reviews/ratings for employers
- Automated test suite (CI currently does a syntax check + live smoke test, not unit tests)

## License
Dheemantha Jayawardhana
SLIIT - Bsc.Hons in Computer Systems and Network Engineering

