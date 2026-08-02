-- Fix user-facing team names
-- Teams with updated name and slug, `where` is "old" name
UPDATE teams
SET name = 'Bristol',
slug = 'bristol'
WHERE name = 'Bristol City';

UPDATE teams
SET name = 'Coventry',
slug = 'coventry'
WHERE name = 'Coventry City';

UPDATE teams
SET name = 'Liverpool',
slug = 'liverpool'
WHERE name = 'Liverpool City';

UPDATE teams
SET name = 'Plymouth',
slug = 'plymouth'
WHERE name = 'Plymouth City';

UPDATE teams
SET name = 'Stockport',
slug = 'stockport'
WHERE name = 'Stockport Metropolitan';

-- Updating name only, slug is unchanged
UPDATE teams
SET name = 'Stoke-on-Trent'
WHERE name = 'Stoke on Trent';
