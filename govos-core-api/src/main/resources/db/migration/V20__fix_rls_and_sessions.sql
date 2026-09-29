-- ============================================================
-- V20: Fix RLS for Sessions and Audit Logs
-- Ensure application connection can manage sessions & auth flows
-- ============================================================

-- Disable FORCE ROW LEVEL SECURITY on sessions and audit tables
-- so system authentication flows and session creation are not blocked
ALTER TABLE sessions NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log NO FORCE ROW LEVEL SECURITY;

-- Defensive update to current_tenant_id() function to handle empty string
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    IF current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '' THEN
        RETURN NULL;
    END IF;
    RETURN current_setting('app.tenant_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
