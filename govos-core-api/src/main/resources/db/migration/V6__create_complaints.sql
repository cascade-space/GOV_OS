CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    complaint_number VARCHAR(255) NOT NULL UNIQUE,
    reporter_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    priority VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    ward_id UUID,
    assigned_to_id UUID,
    ai_assessed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy_complaints ON complaints
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
