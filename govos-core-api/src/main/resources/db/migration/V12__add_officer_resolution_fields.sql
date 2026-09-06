-- Migration V12: Add field officer task execution and resolution evidence fields
ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS resolution_notes        TEXT,
    ADD COLUMN IF NOT EXISTS resolution_evidence_url  TEXT,
    ADD COLUMN IF NOT EXISTS work_started_at         TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS work_completed_at       TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS resolved_at             TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN complaints.resolution_notes IS 'Notes submitted by field officer upon completing work';
COMMENT ON COLUMN complaints.resolution_evidence_url IS 'URL of photo/evidence uploaded by field officer verifying resolution';
COMMENT ON COLUMN complaints.work_started_at IS 'Timestamp when officer began working on the complaint';
COMMENT ON COLUMN complaints.work_completed_at IS 'Timestamp when officer completed work and submitted evidence';
COMMENT ON COLUMN complaints.resolved_at IS 'Timestamp when admin/citizen verified and closed the complaint';
