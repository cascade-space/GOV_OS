package com.govos.core.presentation.directive;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class MlaDirectiveDtos {

    public record IssueDirectiveRequest(
            @NotNull(message = "Complaint ID is required") UUID complaintId,
            @NotBlank(message = "MLA name is required") String mlaName,
            @NotBlank(message = "Constituency is required") String constituency,
            @NotBlank(message = "Directive type is required") String directiveType,
            @NotBlank(message = "Instruction notes are required") String instructionNotes
    ) {}
}
