package com.govos.core.presentation.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ComplaintDtos {
    
    public record CreateComplaintRequest(
            @NotBlank String title,
            @NotBlank String description,
            @NotNull Double latitude,
            @NotNull Double longitude
    ) {}

    public record UpdateStatusRequest(
            @NotBlank String status
    ) {}
}
