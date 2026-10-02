-- Adds password reset support. Run this once in your Supabase SQL Editor.
--
-- We store a HASH of the reset token, never the raw token itself — the
-- raw token only ever exists in the email link and briefly in memory on
-- the server. This way even a database leak can't be used to reset
-- anyone's password.

alter table users add column if not exists reset_token_hash text;
alter table users add column if not exists reset_token_expires timestamptz;
