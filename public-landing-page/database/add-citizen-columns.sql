-- Add citizen name and phone columns to complaints table in civic_platform database

-- Add citizen_name column
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS citizen_name VARCHAR(200);

-- Add citizen_mobile column
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS citizen_mobile VARCHAR(20);

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_mobile ON complaints(citizen_mobile);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_name ON complaints(citizen_name);

-- Verify columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'complaints' 
AND column_name IN ('citizen_name', 'citizen_mobile')
ORDER BY column_name;

-- Success message
SELECT '✅ Citizen name and mobile columns added successfully!' as status;
