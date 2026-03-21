-- Split single 'name' column into 'first_name' + 'last_name'

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate existing data: first word → first_name, rest → last_name
UPDATE users
SET first_name = split_part(name, ' ', 1),
    last_name  = NULLIF(trim(substring(name from position(' ' in name))), '')
WHERE name IS NOT NULL AND name != '';
