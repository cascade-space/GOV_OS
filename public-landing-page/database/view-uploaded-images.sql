-- View all uploaded images with complaint details
-- Run this in pgAdmin to see all images uploaded by citizens

-- Query 1: List all images with complaint information
SELECT 
    c.ticket_number AS "Complaint ID",
    c.citizen_name AS "Citizen Name",
    c.citizen_mobile AS "Mobile",
    c.title AS "Issue Title",
    ma.file_name AS "Image Filename",
    ma.file_url AS "Image URL",
    ma.file_size AS "Size (bytes)",
    ROUND(ma.file_size / 1024.0, 2) AS "Size (KB)",
    ma.mime_type AS "File Type",
    ma.created_at AS "Uploaded At"
FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
ORDER BY ma.created_at DESC;

-- Query 2: Count images per complaint
SELECT 
    c.ticket_number AS "Complaint ID",
    c.citizen_name AS "Citizen",
    c.title AS "Issue",
    COUNT(ma.id) AS "Number of Images",
    SUM(ma.file_size) AS "Total Size (bytes)"
FROM complaints c
LEFT JOIN media_attachments ma ON c.id = ma.complaint_id
GROUP BY c.id, c.ticket_number, c.citizen_name, c.title
HAVING COUNT(ma.id) > 0
ORDER BY COUNT(ma.id) DESC;

-- Query 3: Get images for a specific complaint (replace ticket number)
SELECT 
    ma.file_name AS "Filename",
    ma.file_url AS "URL",
    ma.mime_type AS "Type",
    ROUND(ma.file_size / 1024.0, 2) AS "Size (KB)",
    ma.created_at AS "Uploaded"
FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
WHERE c.ticket_number = 'CMP-2026-000014'  -- Change this to your complaint ID
ORDER BY ma.created_at;

-- Query 4: Total storage statistics
SELECT 
    COUNT(*) AS "Total Images",
    SUM(file_size) AS "Total Bytes",
    ROUND(SUM(file_size) / 1024.0, 2) AS "Total KB",
    ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) AS "Total MB"
FROM media_attachments;

-- Query 5: Images by file type
SELECT 
    mime_type AS "File Type",
    COUNT(*) AS "Count",
    ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) AS "Total MB"
FROM media_attachments
GROUP BY mime_type
ORDER BY COUNT(*) DESC;

-- Query 6: Recent uploads (last 24 hours)
SELECT 
    c.ticket_number,
    c.citizen_name,
    ma.file_name,
    ma.created_at
FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
WHERE ma.created_at > NOW() - INTERVAL '24 hours'
ORDER BY ma.created_at DESC;
