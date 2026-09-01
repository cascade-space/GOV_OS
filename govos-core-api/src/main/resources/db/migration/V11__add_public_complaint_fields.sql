-- Migration V11: Add public complaint fields for citizen self-service portal
-- Adds: reporter_name, reporter_mobile, source (PUBLIC/INTERNAL), sub_category, location_address
ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS reporter_name    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reporter_mobile  VARCHAR(20),
    ADD COLUMN IF NOT EXISTS source           VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    ADD COLUMN IF NOT EXISTS sub_category     VARCHAR(255),
    ADD COLUMN IF NOT EXISTS location_address TEXT;

COMMENT ON COLUMN complaints.source IS 'INTERNAL = submitted by staff, PUBLIC = submitted via citizen portal';
COMMENT ON COLUMN complaints.reporter_name IS 'Name of citizen reporter (for public submissions without a user account)';
COMMENT ON COLUMN complaints.reporter_mobile IS 'Mobile number of citizen reporter (for public submissions)';
