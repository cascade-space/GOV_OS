-- Check if media_attachments table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'media_attachments'
ORDER BY ordinal_position;

-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS media_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_phase VARCHAR(50) DEFAULT 'submission',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_media_attachments_complaint_id ON media_attachments(complaint_id);

-- Verify table was created
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'media_attachments';
