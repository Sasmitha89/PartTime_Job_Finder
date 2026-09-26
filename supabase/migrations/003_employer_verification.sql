-- Adds employer verification and a lightweight admin flag.
-- Run this once in your Supabase SQL Editor.

alter table users add column if not exists verification_status text
  not null default 'unverified'
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected'));

alter table users add column if not exists verification_note text;

alter table users add column if not exists is_admin boolean not null default false;

-- To make yourself an admin so you can approve/reject verification
-- requests, run this once (replace with your actual account email):
--
--   update users set is_admin = true where email = 'you@example.com';
