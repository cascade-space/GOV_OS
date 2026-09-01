-- ============================================
-- CivicPath Database Schema - PostgreSQL
-- ============================================
-- Version: 1.0
-- Date: February 24, 2026
-- Description: Complete database schema for CivicPath civic complaint management system
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin', 'mla', 'supervisor');

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Users table (for officers, admins, MLAs)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    profile_photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create index on email and username for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. DEPARTMENTS & OFFICERS
-- ============================================

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    head_officer_id UUID REFERENCES users(id),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(code);

-- Officers table (extends users)
CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(255),
    ward_assigned VARCHAR(50),
    performance_score DECIMAL(5,2) DEFAULT 0.00,
    total_resolved INTEGER DEFAULT 0,
    total_assigned INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    joined_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_officers_user_id ON officers(user_id);
CREATE INDEX idx_officers_department_id ON officers(department_id);
CREATE INDEX idx_officers_ward ON officers(ward_assigned);

-- ============================================
-- 3. MLA & CONSTITUENCIES
-- ============================================

-- Constituencies table
CREATE TABLE constituencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    total_wards INTEGER,
    population INTEGER,
    area_sq_km DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MLAs table (extends users)
CREATE TABLE mlas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    constituency_id UUID REFERENCES constituencies(id),
    party_name VARCHAR(255),
    term_start_date DATE,
    term_end_date DATE,
    office_address TEXT,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mlas_user_id ON mlas(user_id);
CREATE INDEX idx_mlas_constituency_id ON mlas(constituency_id);

-- ============================================
-- 4. COMPLAINTS/ISSUES
-- ============================================

-- Complaint status enum
CREATE TYPE complaint_status AS ENUM (
    'submitted',
    'validated',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
    'rejected',
    'duplicate',
    'quality_check'
);

-- Priority enum
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Complaints table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Citizen information
    citizen_name VARCHAR(255) NOT NULL,
    citizen_mobile VARCHAR(15) NOT NULL,
    citizen_email VARCHAR(255),
    
    -- Complaint details
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    priority priority_level DEFAULT 'medium',
    status complaint_status DEFAULT 'submitted',
    
    -- Location information
    location_address TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    ward VARCHAR(50) NOT NULL,
    constituency_id UUID REFERENCES constituencies(id),
    
    -- Assignment
    assigned_department_id UUID REFERENCES departments(id),
    assigned_officer_id UUID REFERENCES officers(id),
    
    -- SLA & Escalation
    sla_deadline TIMESTAMP,
    is_escalated BOOLEAN DEFAULT false,
    escalated_at TIMESTAMP,
    escalated_to_id UUID REFERENCES users(id),
    
    -- AI/ML fields
    ai_category_suggestion VARCHAR(100),
    ai_urgency_score DECIMAL(3,2),
    ai_sentiment_score DECIMAL(3,2),
    
    -- Resolution
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    citizen_satisfaction_rating INTEGER CHECK (citizen_satisfaction_rating BETWEEN 1 AND 5),
    citizen_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft delete
    deleted_at TIMESTAMP
);

-- Indexes for complaints
CREATE INDEX idx_complaints_number ON complaints(complaint_number);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_citizen_mobile ON complaints(citizen_mobile);
CREATE INDEX idx_complaints_ward ON complaints(ward);
CREATE INDEX idx_complaints_department ON complaints(assigned_department_id);
CREATE INDEX idx_complaints_officer ON complaints(assigned_officer_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_sla_deadline ON complaints(sla_deadline);
CREATE INDEX idx_complaints_constituency ON complaints(constituency_id);

-- ============================================
-- 5. COMPLAINT ATTACHMENTS
-- ============================================

-- Attachment type enum
CREATE TYPE attachment_type AS ENUM ('photo', 'video', 'document', 'audio');

-- Attachments table
CREATE TABLE complaint_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type attachment_type NOT NULL,
    file_size_kb INTEGER,
    mime_type VARCHAR(100),
    uploaded_by_role user_role,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_complaint_id ON complaint_attachments(complaint_id);

-- ============================================
-- 6. COMPLAINT HISTORY & ACTIVITY LOG
-- ============================================

-- Activity type enum
CREATE TYPE activity_type AS ENUM (
    'created',
    'status_changed',
    'assigned',
    'reassigned',
    'comment_added',
    'escalated',
    'resolved',
    'closed',
    'reopened',
    'attachment_added'
);

-- Complaint history table
CREATE TABLE complaint_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    old_status complaint_status,
    new_status complaint_status,
    performed_by_id UUID REFERENCES users(id),
    performed_by_role user_role,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_complaint_id ON complaint_history(complaint_id);
CREATE INDEX idx_history_created_at ON complaint_history(created_at);

-- ============================================
-- 7. COMMENTS & WORK NOTES
-- ============================================

-- Comment visibility enum
CREATE TYPE comment_visibility AS ENUM ('public', 'internal', 'private');

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment_text TEXT NOT NULL,
    visibility comment_visibility DEFAULT 'internal',
    is_work_note BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_complaint_id ON comments(complaint_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- ============================================
-- 8. MLA DIRECTIVES
-- ============================================

-- Directive status enum
CREATE TYPE directive_status AS ENUM ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled');

-- MLA directives table
CREATE TABLE mla_directives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    mla_id UUID NOT NULL REFERENCES mlas(id),
    directive_text TEXT NOT NULL,
    priority priority_level DEFAULT 'high',
    status directive_status DEFAULT 'pending',
    target_department_id UUID REFERENCES departments(id),
    target_officer_id UUID REFERENCES officers(id),
    deadline TIMESTAMP,
    acknowledged_at TIMESTAMP,
    acknowledged_by_id UUID REFERENCES users(id),
    completed_at TIMESTAMP,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_directives_complaint_id ON mla_directives(complaint_id);
CREATE INDEX idx_directives_mla_id ON mla_directives(mla_id);
CREATE INDEX idx_directives_status ON mla_directives(status);

-- ============================================
-- 9. ANNOUNCEMENTS
-- ============================================

-- Announcement type enum
CREATE TYPE announcement_type AS ENUM ('general', 'maintenance', 'emergency', 'event', 'policy');

-- Announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type announcement_type DEFAULT 'general',
    priority priority_level DEFAULT 'medium',
    created_by_id UUID REFERENCES users(id),
    target_audience user_role[],
    ward VARCHAR(50),
    constituency_id UUID REFERENCES constituencies(id),
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_published_at ON announcements(published_at);

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
    'complaint_created',
    'complaint_assigned',
    'status_updated',
    'comment_added',
    'directive_issued',
    'sla_warning',
    'sla_breached',
    'escalation',
    'resolution',
    'feedback_request'
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    complaint_id UUID REFERENCES complaints(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- 11. ANALYTICS & STATISTICS
-- ============================================

-- Daily statistics table (for performance)
CREATE TABLE daily_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_date DATE NOT NULL,
    department_id UUID REFERENCES departments(id),
    ward VARCHAR(50),
    constituency_id UUID REFERENCES constituencies(id),
    
    -- Complaint metrics
    total_submitted INTEGER DEFAULT 0,
    total_resolved INTEGER DEFAULT 0,
    total_pending INTEGER DEFAULT 0,
    total_escalated INTEGER DEFAULT 0,
    
    -- SLA metrics
    sla_met INTEGER DEFAULT 0,
    sla_breached INTEGER DEFAULT 0,
    avg_resolution_time_hours DECIMAL(10,2),
    
    -- Satisfaction
    avg_satisfaction_rating DECIMAL(3,2),
    total_feedback_received INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(stat_date, department_id, ward)
);

CREATE INDEX idx_daily_stats_date ON daily_statistics(stat_date);
CREATE INDEX idx_daily_stats_department ON daily_statistics(department_id);

-- ============================================
-- 12. SYSTEM CONFIGURATION
-- ============================================

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. AUDIT LOG
-- ============================================

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_officers_updated_at BEFORE UPDATE ON officers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlas_updated_at BEFORE UPDATE ON mlas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_directives_updated_at BEFORE UPDATE ON mla_directives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Active complaints with full details
CREATE VIEW v_active_complaints AS
SELECT 
    c.*,
    d.name as department_name,
    d.code as department_code,
    u.full_name as officer_name,
    u.mobile as officer_mobile,
    o.employee_id as officer_employee_id,
    con.name as constituency_name
FROM complaints c
LEFT JOIN departments d ON c.assigned_department_id = d.id
LEFT JOIN officers o ON c.assigned_officer_id = o.id
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN constituencies con ON c.constituency_id = con.id
WHERE c.status NOT IN ('closed', 'rejected')
AND c.deleted_at IS NULL;

-- View: Officer performance summary
CREATE VIEW v_officer_performance AS
SELECT 
    o.id as officer_id,
    u.full_name as officer_name,
    o.employee_id,
    d.name as department_name,
    o.ward_assigned,
    o.total_assigned,
    o.total_resolved,
    o.performance_score,
    CASE 
        WHEN o.total_assigned > 0 
        THEN ROUND((o.total_resolved::DECIMAL / o.total_assigned * 100), 2)
        ELSE 0 
    END as resolution_rate,
    COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) as current_active_tasks
FROM officers o
JOIN users u ON o.user_id = u.id
LEFT JOIN departments d ON o.department_id = d.id
LEFT JOIN complaints c ON c.assigned_officer_id = o.id AND c.status = 'in_progress'
WHERE u.status = 'active'
GROUP BY o.id, u.full_name, o.employee_id, d.name, o.ward_assigned, 
         o.total_assigned, o.total_resolved, o.performance_score;

-- View: Department statistics
CREATE VIEW v_department_statistics AS
SELECT 
    d.id as department_id,
    d.name as department_name,
    d.code as department_code,
    COUNT(DISTINCT o.id) as total_officers,
    COUNT(c.id) as total_complaints,
    COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved_complaints,
    COUNT(CASE WHEN c.status IN ('submitted', 'validated', 'assigned', 'in_progress') THEN 1 END) as pending_complaints,
    COUNT(CASE WHEN c.is_escalated = true THEN 1 END) as escalated_complaints,
    COUNT(CASE WHEN c.sla_deadline < CURRENT_TIMESTAMP AND c.status NOT IN ('resolved', 'closed') THEN 1 END) as sla_breached,
    ROUND(AVG(c.citizen_satisfaction_rating), 2) as avg_satisfaction
FROM departments d
LEFT JOIN officers o ON o.department_id = d.id
LEFT JOIN complaints c ON c.assigned_department_id = d.id AND c.deleted_at IS NULL
WHERE d.is_active = true
GROUP BY d.id, d.name, d.code;

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function to generate complaint number
CREATE OR REPLACE FUNCTION generate_complaint_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_number TEXT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT LPAD((COUNT(*) + 1)::TEXT, 5, '0')
    INTO sequence_part
    FROM complaints
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    new_number := 'CMP-' || year_part || '-' || sequence_part;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate SLA deadline
CREATE OR REPLACE FUNCTION calculate_sla_deadline(
    p_priority priority_level,
    p_category VARCHAR
)
RETURNS TIMESTAMP AS $$
DECLARE
    hours_to_add INTEGER;
BEGIN
    -- SLA hours based on priority
    CASE p_priority
        WHEN 'critical' THEN hours_to_add := 4;
        WHEN 'high' THEN hours_to_add := 24;
        WHEN 'medium' THEN hours_to_add := 72;
        WHEN 'low' THEN hours_to_add := 168;
        ELSE hours_to_add := 72;
    END CASE;
    
    RETURN CURRENT_TIMESTAMP + (hours_to_add || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA / SEED DATA
-- ============================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('sla_critical_hours', '4', 'integer', 'SLA hours for critical priority complaints', true),
('sla_high_hours', '24', 'integer', 'SLA hours for high priority complaints', true),
('sla_medium_hours', '72', 'integer', 'SLA hours for medium priority complaints', true),
('sla_low_hours', '168', 'integer', 'SLA hours for low priority complaints', true),
('auto_escalate_enabled', 'true', 'boolean', 'Enable automatic escalation on SLA breach', false),
('citizen_feedback_enabled', 'true', 'boolean', 'Enable citizen feedback collection', true),
('max_attachments_per_complaint', '5', 'integer', 'Maximum attachments allowed per complaint', true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE complaints IS 'Main table storing all citizen complaints/issues';
COMMENT ON TABLE users IS 'User accounts for officers, admins, and MLAs';
COMMENT ON TABLE departments IS 'Government departments handling complaints';
COMMENT ON TABLE officers IS 'Field officers assigned to resolve complaints';
COMMENT ON TABLE mlas IS 'Member of Legislative Assembly profiles';
COMMENT ON TABLE complaint_history IS 'Audit trail of all complaint status changes';
COMMENT ON TABLE mla_directives IS 'Directives issued by MLAs for specific complaints';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE daily_statistics IS 'Pre-aggregated daily statistics for performance';

-- ============================================
-- END OF SCHEMA
-- ============================================
