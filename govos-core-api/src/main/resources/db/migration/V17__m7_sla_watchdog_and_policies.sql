-- Migration V17: Milestone M7 SLA Policies and Automated Escalation Engine
CREATE TABLE IF NOT EXISTS sla_policies (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id               UUID REFERENCES departments(id) ON DELETE SET NULL,
    category                    VARCHAR(100),
    priority                    VARCHAR(20) NOT NULL,
    resolution_hours            INT NOT NULL,
    warning_threshold_ratio     DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    escalation_level_1_hours    INT NOT NULL DEFAULT 24,
    escalation_level_2_hours    INT NOT NULL DEFAULT 48,
    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sla_policy_lookup ON sla_policies(tenant_id, priority);
CREATE INDEX IF NOT EXISTS idx_sla_policy_cat_lookup ON sla_policies(tenant_id, category, priority);

COMMENT ON TABLE sla_policies IS 'Configurable SLA resolution targets, warning thresholds, and escalation timelines';
COMMENT ON COLUMN sla_policies.warning_threshold_ratio IS 'Ratio of total SLA time elapsed before warning fires (default 0.75 = 75%)';
COMMENT ON COLUMN sla_policies.escalation_level_1_hours IS 'Hours past initial breach before Level 1 escalation to Department Head';
COMMENT ON COLUMN sla_policies.escalation_level_2_hours IS 'Hours past initial breach before Level 2 escalation to Municipal Commissioner';

-- Seed default SLA policies for the demo municipality tenant
INSERT INTO sla_policies (tenant_id, priority, resolution_hours, warning_threshold_ratio, escalation_level_1_hours, escalation_level_2_hours)
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'CRITICAL', 12, 0.75, 6, 12),
    ('00000000-0000-0000-0000-000000000002', 'HIGH', 24, 0.75, 12, 24),
    ('00000000-0000-0000-0000-000000000002', 'MEDIUM', 48, 0.75, 24, 48),
    ('00000000-0000-0000-0000-000000000002', 'LOW', 72, 0.75, 24, 48)
ON CONFLICT DO NOTHING;
