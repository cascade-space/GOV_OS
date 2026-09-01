package com.govos.core.presentation.dashboard.dto;

import java.util.Map;

public record DashboardSummary(
        String role,
        Map<String, Object> metrics
) {}
