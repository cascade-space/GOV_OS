-- =====================================================
-- Officers Table Migration for MLA Officer Management
-- Run this in your PostgreSQL database (local + Render)
-- =====================================================

-- Drop old officers table if it exists
DROP TABLE IF EXISTS officers CASCADE;

-- Create as civicpath_user (run this while connected as civicpath_user)
-- OR run the GRANT commands below if running as postgres superuser

CREATE TABLE officers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'officer',
    mla_id TEXT,  -- UUID from users table
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- IMPORTANT: Grant permissions to app user (run as postgres superuser)
GRANT ALL PRIVILEGES ON TABLE officers TO civicpath_user;
GRANT USAGE, SELECT ON SEQUENCE officers_id_seq TO civicpath_user;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_officers_email ON officers(email);
CREATE INDEX IF NOT EXISTS idx_officers_mla_id ON officers(mla_id);
CREATE INDEX IF NOT EXISTS idx_officers_status ON officers(status);
CREATE INDEX IF NOT EXISTS idx_officers_department ON officers(department);

-- Verify
SELECT 'Officers table created successfully' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'officers' ORDER BY ordinal_position;