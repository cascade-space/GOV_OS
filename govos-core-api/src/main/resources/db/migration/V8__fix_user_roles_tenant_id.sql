-- ============================================================
-- V6: Fix user_roles tenant_id insertion
-- GovOS MTAS — Identity & Access
-- ============================================================

-- When Hibernate inserts into user_roles via @ManyToMany @JoinTable,
-- it does not know about the tenant_id column, causing a NOT NULL constraint violation.
-- This trigger intercepts the insert and automatically sets the tenant_id
-- to match the user's tenant_id.

CREATE OR REPLACE FUNCTION trg_set_user_roles_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id FROM users WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_roles_tenant_id_trigger ON user_roles;

CREATE TRIGGER user_roles_tenant_id_trigger
    BEFORE INSERT ON user_roles
    FOR EACH ROW
    WHEN (NEW.tenant_id IS NULL)
    EXECUTE FUNCTION trg_set_user_roles_tenant_id();
