-- Migration V16: Milestone M6 Transactional Outbox Pattern for Realtime Events
CREATE TABLE IF NOT EXISTS outbox_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type          VARCHAR(100) NOT NULL,
    aggregate_type      VARCHAR(50) NOT NULL,
    aggregate_id        UUID NOT NULL,
    payload             JSONB NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count         INT NOT NULL DEFAULT 0,
    error_message       TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    published_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(status, created_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_outbox_tenant ON outbox_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_outbox_published_at ON outbox_events(published_at);

COMMENT ON TABLE outbox_events IS 'Transactional outbox for reliable at-least-once event delivery to Redis and realtime consumers';
COMMENT ON COLUMN outbox_events.status IS 'Event delivery status: PENDING, PUBLISHED, or FAILED';
COMMENT ON COLUMN outbox_events.payload IS 'Full JSON payload broadcasted across Redis and WebSockets';
