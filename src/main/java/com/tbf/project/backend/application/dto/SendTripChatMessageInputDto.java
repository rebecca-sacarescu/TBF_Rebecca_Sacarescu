package com.tbf.project.backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendTripChatMessageInputDto(

        @NotBlank(message = "Message content cannot be blank.")
        @Size(max = 1000, message = "Message content cannot exceed 1000 characters.")
        String content
) {
}