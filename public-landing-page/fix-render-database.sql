-- Fix missing created_at column in complaints table
-- Run this on your Render PostgreSQL database

-- Add created_at column if it doesn't exist
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column if it doesn't exist
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have timestamps
UPDATE complaints 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

UPDATE complaints 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'complaints' 
AND column_name IN ('created_at', 'updated_at');
