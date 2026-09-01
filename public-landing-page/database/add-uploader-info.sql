-- Add uploader information to complaint_attachments table
-- This will help track who uploaded each image

-- Add uploaded_by_name column
ALTER TABLE complaint_attachments 
ADD COLUMN IF NOT EXISTS uploaded_by_name VARCHAR(255);

-- Add uploaded_by_mobile column
ALTER TABLE complaint_attachments 
ADD COLUMN IF NOT EXISTS uploaded_by_mobile VARCHAR(15);

-- Add comment to explain the columns
COMMENT ON COLUMN complaint_attachments.uploaded_by_name IS 'Name of the person who uploaded the attachment';
COMMENT ON COLUMN complaint_attachments.uploaded_by_mobile IS 'Mobile number of the person who uploaded the attachment';

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'complaint_attachments' 
ORDER BY ordinal_position;
