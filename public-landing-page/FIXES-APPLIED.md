# Fixes Applied - Complaint System

## Date: February 25, 2026

## Problem
- Getting 404 error when tracking complaints
- Complaints not showing in database
- Error: "column c.complaint_number does not exist"

## Root Causes Found

### 1. Database Connection Issue
**Problem**: Backend was connecting to wrong database
- `.env` was configured to use `civic_platform` database
- `civic_platform` database had old schema with `ticket_number` column
- Correct database `civicpath` has proper schema with `complaint_number` column

**Fix**: Updated `backend/.env`
```
DB_NAME=civicpath
DB_USER=civicpath_user
```

### 2. Controller Code Issues
**Problem**: Multiple mismatches between code and database schema

**Fixes Applied**:

a) **Column name mismatch** in `trackComplaint` function
   - Changed from `ticket_number` to `complaint_number`
   
b) **Wrong table name** for history
   - Changed from `complaint_status_history` to `complaint_history`
   - Updated INSERT and SELECT queries
   
c) **Wrong table name** for attachments
   - Changed from `media_attachments` to `complaint_attachments`
   - Updated column names to match schema
   
d) **Ambiguous column reference**
   - Changed `deleted_at IS NULL` to `c.deleted_at IS NULL` in getAllComplaints
   
e) **Missing JOIN** in trackComplaint
   - Added proper JOIN through officers table to get user details

f) **INSERT query mismatch**
   - Updated createComplaint to use correct column names:
     - `sub_category` instead of missing
     - `location_address`, `latitude`, `longitude` instead of just `address`
     - `complaint_number` generated via `generate_complaint_number()` function

## Testing Results

### ✅ Create Complaint
```bash
POST http://localhost:5000/api/v1/complaints
Response: 201 Created
Complaint Number: CMP-2026-00002
```

### ✅ Track Complaint
```bash
GET http://localhost:5000/api/v1/complaints/track/CMP-2026-00002
Response: 200 OK
Data: Full complaint details with history
```

### ✅ Database Verification
```sql
SELECT complaint_number, title, status FROM complaints;
-- Returns: 2 complaints successfully stored
```

## Files Modified

1. `backend/.env` - Database configuration
2. `backend/src/controllers/complaint.controller.js` - Fixed all queries and table names

## Current Status

✅ Backend server running on port 5000
✅ Connected to correct database: `civicpath`
✅ Complaints can be created successfully
✅ Complaints can be tracked by complaint number
✅ Data persists in database correctly
✅ History tracking working

## Next Steps

1. Test with frontend application
2. Test file upload functionality
3. Test other endpoints (getAllComplaints, getComplaintById, etc.)
4. Consider migrating data from `civic_platform` to `civicpath` if needed

## Notes

- The `civic_platform` database still exists with 5 old complaints
- If you need that data, you'll need to migrate it to the `civicpath` database
- The schema in `civicpath` is the correct one matching `database/schema.sql`
