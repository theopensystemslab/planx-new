-- Align all PlanX team 'slugs' to each council's web domain

-- Teams with updated name and slug, where is "old" name
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

UPDATE teams
SET name = 'Stoke-on-Trent',
slug = 'stoke'
WHERE name = 'Stoke on Trent';

-- Teams with updated slug only, where is "old" slug
UPDATE teams
SET slug = 'lbbd'
WHERE slug = 'barking-and-dagenham';

UPDATE teams
SET slug = 'beacons-npa'
WHERE slug = 'bannau-brycheiniog';

UPDATE teams
SET slug = 'eastriding'
WHERE slug = 'east-riding-of-yorkshire';

UPDATE teams
SET slug = 'epsom-ewell'
WHERE slug = 'epsom-and-ewell';

UPDATE teams
SET slug = 'greatercambridgeplanning'
WHERE slug = 'greater-cambridge-shared-planning';

UPDATE teams
SET slug = 'northtyneside'
WHERE slug = 'north-tyneside';

UPDATE teams 
SET slug = 'southglos'
WHERE slug = 'south-gloucestershire';

UPDATE teams
SET slug = 'sstaffs'
WHERE slug = 'south-staffordshire';

UPDATE teams
set slug = 'stalbans'
WHERE slug = 'st-albans';

UPDATE teams
SET slug = 'walthamforest'
WHERE slug = 'waltham-forest';

UPDATE teams
SET slug = 'westberks'
WHERE slug = 'west-berkshire';
