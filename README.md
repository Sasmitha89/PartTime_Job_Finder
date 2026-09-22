# Shiftly — Part-Time Job Finder

A full-stack job board where **employers** can post part-time, remote, and internship roles, and **job seekers** can browse and apply — built with Node.js/Express, MongoDB, and a vanilla JS frontend.

## Features

- 🔐 JWT-based authentication with two roles: `jobseeker` and `employer`
- 💼 Employers can post, edit, close/reopen, and delete jobs
- 📝 Job seekers can apply to jobs (duplicate applications are blocked)
- ⚡ Two review modes per job:
  - **Auto** — applicants are instantly assigned while vacancies remain, or told the job is full
  - **Manual** — applications go to "pending" for the employer to Accept/Reject from the Applicants dashboard
- 📊 Employer dashboard ("My Jobs") — applicant counts, filled/vacancy ratio, edit/close/delete
- 📬 Job seeker "My Applications" tab — shows every application's current status (awaiting review / assigned / not selected), so outcomes aren't lost after closing the browser
- 🧑‍💼 Job seeker profile — skills, bio, and a PDF resume upload (stored in Supabase Storage), visible to employers reviewing applicants
- 🔍 Client-side search, type filter, and sort on the Jobs page
- 🎨 Modern, responsive UI with role-aware navigation and validated forms

## Tech Stack

**Backend:** Node.js, Express 5, PostgreSQL (via Supabase), JWT, bcrypt, CORS
**Frontend:** Vanilla HTML/CSS/JavaScript (no build step required)

## Project Structure

```
job-finder/
├── Client/
│   └── index.html          # Frontend (open directly in a browser)
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   └── applicationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── user.js
│   │   ├── job.js
│   │   └── application.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   └── applicationRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── supabase/
│   └── schema.sql          # Run this in Supabase's SQL Editor before first use
└── .gitignore
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A free [Supabase](https://supabase.com) account and project

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/job-finder.git
cd job-finder
```

### 2. Create the database tables in Supabase

In your Supabase project, open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates the `users`, `jobs`, and `applications` tables.

### 3. Set up environment variables

Copy the example file and fill in your own values:

```bash
cd server
cp .env.example .env
```

Then edit `.env`. Get the connection string from Supabase under **Project Settings → Database → Connection string → URI** (choose the URI format, and fill in the database password you set when creating the project):

```
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres
JWT_SECRET=your_jwt_secret_here
```

### 4. Install backend dependencies

```bash
npm install
```

### 5. Start the backend server

```bash
npm run dev
```

You should see `Database connected` and `Server running on port 5000` in the terminal. Visiting `http://localhost:5000` in a browser should show:

```
Job Finder API is running 🚀
```

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

| Method | Endpoint       | Description                              | Auth required                          |
|--------|----------------|-------------------------------------------|------------------------------------------|
| GET    | `/`            | List all **open** jobs                     | No                                       |
| GET    | `/mine`        | List the logged-in employer's own jobs (open + closed), with applicant counts | Yes — `employer` only |
| POST   | `/`            | Create a job                                | Yes — `employer` only                  |
| PUT    | `/:id`         | Edit a job you posted                       | Yes — `employer`, must own the job     |
| PATCH  | `/:id/status`  | Close or reopen a job (`{ "isOpen": false }`) | Yes — `employer`, must own the job   |
| DELETE | `/:id`         | Delete a job you posted (cascades to its applications) | Yes — `employer`, must own the job |

Jobs can be created with a `reviewMode` of `"auto"` (default — applicants are instantly assigned while vacancies remain) or `"manual"` (applications go to `pending` for the employer to review).

### Applications (`/api/applications`)

| Method | Endpoint  | Description                                         | Auth required                              |
|--------|-----------|------------------------------------------------------|-----------------------------------------------|
| POST   | `/:jobId` | Apply to a job                                       | Yes — `jobseeker` only                     |
| GET    | `/mine`   | View your own applications and their current status  | Yes — `jobseeker` only                     |
| GET    | `/`       | View applications to jobs **you** posted             | Yes — `employer` only                      |
| PUT    | `/:id`    | Update an application's status (`pending`/`accepted`/`rejected`) | Yes — `employer`, must own the job the application belongs to; accepting is blocked once the job's vacancies are filled |

### Users / Profile (`/api/users`)

| Method | Endpoint         | Description                                  | Auth required                              |
|--------|------------------|------------------------------------------------|-----------------------------------------------|
| GET    | `/me`            | Get your own profile                           | Yes                                          |
| PUT    | `/me`            | Update skills, bio, location                   | Yes                                          |
| POST   | `/me/resume`     | Upload/replace your resume (PDF, max 5MB)       | Yes — `jobseeker` only                     |
| GET    | `/:id/resume`    | Get a short-lived signed URL to view a resume    | Yes — the resume owner, or an employer     |

All authenticated requests need an `Authorization: Bearer <token>` header.

## Security Notes

- Never commit your `.env` file — it's already listed in `.gitignore`. Use `.env.example` as a template for required variables.
- If a `.env` was ever committed to this repo's history before `.gitignore` was added, rotate `JWT_SECRET` and your Supabase database password, since old commits still contain them even after deleting the file.
- You can rotate your Supabase database password anytime from **Project Settings → Database → Reset database password** if you're ever unsure whether it leaked.

## License

This project is currently unlicensed — add a license of your choice if you plan to share or open-source it.
