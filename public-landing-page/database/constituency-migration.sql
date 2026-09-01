-- ============================================================
-- CONSTITUENCY MIGRATION — Fixed for UUID primary keys
-- Run this in pgAdmin on Railway database
-- ============================================================

-- Step 1: Create constituencies table with UUID id
CREATE TABLE IF NOT EXISTS constituencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Create wards table with UUID foreign key
CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    constituency_id UUID NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, constituency_id)
);

-- Step 3: Add constituency_id (UUID) to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS constituency_id UUID REFERENCES constituencies(id);

-- Step 4: Add ward_id (UUID) to complaints
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ward_id UUID REFERENCES wards(id);

-- Step 5: Add constituency_id (UUID) to officers
ALTER TABLE officers ADD COLUMN IF NOT EXISTS constituency_id UUID REFERENCES constituencies(id);

-- Step 6: Seed sample constituencies
INSERT INTO constituencies (name, description) VALUES
    ('Hubli-Dharwad Central', 'Central urban area of Hubli city'),
    ('Hubli-Dharwad East',    'Eastern zones including Unkal and Gokul Road'),
    ('Hubli-Dharwad West',    'Western zones including Navanagar')
ON CONFLICT (name) DO NOTHING;

-- Step 7: Seed wards (using subquery to get constituency UUIDs)
INSERT INTO wards (name, constituency_id)
SELECT w.name, c.id
FROM (VALUES
    ('Sirur Park',       'Hubli-Dharwad Central'),
    ('Vidyanagar',       'Hubli-Dharwad Central'),
    ('Keshwapur',        'Hubli-Dharwad Central'),
    ('Prashant Colony',  'Hubli-Dharwad Central'),
    ('Deshpande Nagar',  'Hubli-Dharwad Central'),
    ('Unkal',            'Hubli-Dharwad East'),
    ('Gokul Road',       'Hubli-Dharwad East'),
    ('Hosur',            'Hubli-Dharwad East'),
    ('Tarihal',          'Hubli-Dharwad East'),
    ('Navanagar',        'Hubli-Dharwad West'),
    ('Toll Gate',        'Hubli-Dharwad West'),
    ('Hebbal',           'Hubli-Dharwad West')
) AS w(name, constituency_name)
JOIN constituencies c ON c.name = w.constituency_name
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Step 8: Assign existing MLA to first constituency
UPDATE users
SET constituency_id = (SELECT id FROM constituencies WHERE name = 'Hubli-Dharwad Central' LIMIT 1)
WHERE role = 'mla' AND constituency_id IS NULL;

-- Step 9: Assign officers to constituency via their MLA
UPDATE officers o
SET constituency_id = u.constituency_id
FROM users u
WHERE o.mla_id = u.id::text
  AND o.constituency_id IS NULL
  AND u.constituency_id IS NOT NULL;

