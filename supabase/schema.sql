-- Shiftly / Job Finder — Supabase (Postgres) schema
-- Run this once in your Supabase project's SQL Editor
-- (or via `psql` against any Postgres database) before starting the server.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text not null default 'jobseeker' check (role in ('jobseeker', 'employer')),
  skills text[],
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  company text not null,
  location text not null,
  salary numeric,
  vacancies integer not null default 1 check (vacancies >= 1),
  type text not null default 'part-time' check (type in ('part-time', 'remote', 'internship')),
  posted_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  applicant_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'assigned', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create index if not exists idx_jobs_posted_by on jobs(posted_by);
create index if not exists idx_applications_job_id on applications(job_id);
create index if not exists idx_applications_applicant_id on applications(applicant_id);
