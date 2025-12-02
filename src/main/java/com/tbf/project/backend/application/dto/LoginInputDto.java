package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginInputDto(
        @NotBlank(message = "Email required")
        @Email(message = "Invalid email")
        String email,

        @NotBlank(message = "Password required")
        String password
) {}