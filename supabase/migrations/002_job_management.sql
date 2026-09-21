-- Adds employer job-management fields: review mode (auto vs manual
-- applicant review) and an open/closed flag so employers can close a
-- listing without deleting it. Run this once in your Supabase SQL Editor.

alter table jobs add column if not exists review_mode text not null default 'auto'
  check (review_mode in ('auto', 'manual'));

alter table jobs add column if not exists is_open boolean not null default true;
