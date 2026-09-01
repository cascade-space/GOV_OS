-- View all uploaded images with uploader information

SELECT 
    ca.id,
    c.complaint_number,
    c.title as complaint_title,
    ca.file_name,
    ca.file_url,
    ca.file_type,
    ca.file_size_kb,
    ca.uploaded_by_name,
    ca.uploaded_by_mobile,
    ca.uploaded_by_role,
    ca.uploaded_at,
    c.citizen_name,
    c.citizen_mobile
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
ORDER BY ca.uploaded_at DESC;

-- Count images by uploader
SELECT 
    uploaded_by_name,
    uploaded_by_mobile,
    COUNT(*) as total_uploads,
    SUM(file_size_kb) as total_size_kb
FROM complaint_attachments
WHERE uploaded_by_name IS NOT NULL
GROUP BY uploaded_by_name, uploaded_by_mobile
ORDER BY total_uploads DESC;

-- View images for a specific complaint
-- Replace 'CMP-2026-00001' with your complaint number
SELECT 
    ca.file_name,
    ca.file_url,
    ca.file_type,
    ca.uploaded_by_name,
    ca.uploaded_by_mobile,
    ca.uploaded_at
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
WHERE c.complaint_number = 'CMP-2026-00001'
ORDER BY ca.uploaded_at;
