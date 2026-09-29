-- Migration V15: Milestone M5 Closed-Loop Verification, QC Rework & Citizen Confirmation
ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS rework_reason             TEXT,
    ADD COLUMN IF NOT EXISTS rework_count              INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS citizen_rating            INT,
    ADD COLUMN IF NOT EXISTS citizen_feedback          TEXT,
    ADD COLUMN IF NOT EXISTS resolution_latitude       DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS resolution_longitude      DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS distance_deviation_meters DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS auto_close_at             TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN complaints.rework_reason IS 'Mandatory notes submitted by QC verifier explaining why work was rejected';
COMMENT ON COLUMN complaints.rework_count IS 'Number of times this complaint has been sent back for rework';
COMMENT ON COLUMN complaints.citizen_rating IS 'Citizen satisfaction rating from 1 to 5 stars';
COMMENT ON COLUMN complaints.citizen_feedback IS 'Citizen comments upon confirming or contesting resolution';
COMMENT ON COLUMN complaints.resolution_latitude IS 'Latitude captured at the time the officer submitted work completion';
COMMENT ON COLUMN complaints.resolution_longitude IS 'Longitude captured at the time the officer submitted work completion';
COMMENT ON COLUMN complaints.distance_deviation_meters IS 'Calculated distance in meters between complaint coordinates and resolution coordinates';
COMMENT ON COLUMN complaints.auto_close_at IS 'Timestamp after which a RESOLVED complaint automatically moves to CLOSED (72-hour window)';
