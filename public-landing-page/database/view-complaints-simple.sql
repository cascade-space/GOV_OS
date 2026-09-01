-- Simple view of complaints with Name, Phone, Complaint ID, and Status
-- Run this query in pgAdmin to see your complaints

SELECT 
    ticket_number AS "Complaint ID",
    citizen_name AS "Name",
    citizen_mobile AS "Phone Number",
    status AS "Status",
    title AS "Issue",
    category AS "Category",
    created_at AS "Submitted On"
FROM complaints 
ORDER BY created_at DESC;
