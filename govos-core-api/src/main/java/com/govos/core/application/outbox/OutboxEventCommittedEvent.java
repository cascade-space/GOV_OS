package com.govos.core.application.outbox;

import java.util.UUID;

public record OutboxEventCommittedEvent(UUID eventId) {
}
