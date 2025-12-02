package com.tbf.project.backend.application.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

//define the shape of the data the Use Cases except
//record because they are immutable and concise
public record RegisterInputDto(
        @NotBlank(message = "Username required")
        @Size(min = 3, max = 32, message = "Username must be between 3 and 32 characters")
        @Pattern(
                regexp = "^[A-Za-z0-9._\\- ]+$",
                message = "Username may contain only letters, numbers, spaces, dots, underscores, and hyphens"
        )
        String username,

        @NotBlank(message = "Email required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password required")
        @Size(min = 8, message = "Password must be at least 8 characters")

        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
                message = "Password must contain uppercase, lowercase, number, and special character"
        )
        String password
) {
}
