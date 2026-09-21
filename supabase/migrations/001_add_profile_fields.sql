-- Adds profile fields for the Resume/Profile feature.
-- Run this once in your Supabase SQL Editor (safe to run even if some
-- columns already exist, thanks to IF NOT EXISTS).

alter table users add column if not exists bio text;
alter table users add column if not exists resume_path text;
