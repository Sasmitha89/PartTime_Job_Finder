# Shiftly — Part-Time Job Finder

A full-stack job board where **employers** can post part-time, remote, and internship roles, and **job seekers** can browse and apply — built with Node.js/Express, MongoDB, and a vanilla JS frontend.

## Features

- 🔐 JWT-based authentication with two roles: `jobseeker` and `employer`
- 💼 Employers can post jobs; jobs are publicly listable without logging in
- 📝 Job seekers can apply to jobs (duplicate applications are blocked)
- 📊 Employers can view and update the status of applications (`pending`, `accepted`, `rejected`)
- 🔍 Client-side search, type filter, and sort on the Jobs page
- 🎨 Modern, responsive UI with role-aware navigation and validated forms

## Tech Stack

**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt, CORS
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
└── .gitignore
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A MongoDB database — either a local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/job-finder.git
cd job-finder
```

### 2. Set up environment variables

Copy the example file and fill in your own values:

```bash
cd server
cp .env.example .env
```

Then edit `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Install backend dependencies

```bash
npm install
```

### 4. Start the backend server

```bash
npm run dev
```

You should see `MongoDB Connected` and `Server running on port 5000` in the terminal. Visiting `http://localhost:5000` in a browser should show:

```
Job Finder API is running 
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

| Method | Endpoint | Description             | Auth required        |
|--------|----------|--------------------------|------------------------|
| GET    | `/`      | List all jobs             | No                     |
| POST   | `/`      | Create a job               | Yes — `employer` only |

### Applications (`/api/applications`)

| Method | Endpoint  | Description                      | Auth required          |
|--------|-----------|------------------------------------|--------------------------|
| POST   | `/:jobId` | Apply to a job                     | Yes — `jobseeker` only |
| GET    | `/`       | View all applications              | Yes — `employer` only  |
| PUT    | `/:id`    | Update an application's status      | Yes — `employer` only  |

All authenticated requests need an `Authorization: Bearer <token>` header.

## Security Notes

- Never commit your `.env` file — it's already listed in `.gitignore`. Use `.env.example` as a template for required variables.
- If a `.env` was ever committed to this repo's history before `.gitignore` was added, rotate `JWT_SECRET` and your MongoDB credentials, since old commits still contain them even after deleting the file.

## License

This project is currently unlicensed — add a license of your choice if you plan to share or open-source it.
