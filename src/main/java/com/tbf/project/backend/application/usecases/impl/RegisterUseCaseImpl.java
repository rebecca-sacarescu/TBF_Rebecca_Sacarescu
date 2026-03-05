package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.AuthResponseDto;
import com.tbf.project.backend.application.dto.RegisterInputDto;
import com.tbf.project.backend.application.usecases.RegisterUseCase;
import com.tbf.project.backend.entities.gateway.PasswordEncoderGateway;
import com.tbf.project.backend.entities.gateway.TokenGateway;
import com.tbf.project.backend.entities.gateway.UserGateway;
import com.tbf.project.backend.entities.model.User;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

//the usecase doesn't know details of the infrastructure(db, jpa, jwt)
//doesn't depend on spring security
//depends only on the gateway (interfaces, which are implemented by the adapters)
public class RegisterUseCaseImpl implements RegisterUseCase {

    private final UserGateway userGateway;
    private final PasswordEncoderGateway passwordEncoder;
    private final TokenGateway tokenGateway;

    public RegisterUseCaseImpl(UserGateway userGateway,
                               PasswordEncoderGateway passwordEncoder,
                               TokenGateway tokenGateway) {
        this.userGateway = userGateway;
        this.passwordEncoder = passwordEncoder;
        this.tokenGateway = tokenGateway;
    }

    @Override
    public AuthResponseDto execute(RegisterInputDto input){
        //validates business rules
        validateInput(input);

        if (userGateway.existsByEmail(input.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userGateway.existsByUsername(input.username())) {
            throw new IllegalArgumentException("Username already in use");
        }

        User user = User.builder()
                .username(input.username())
                .email(input.email())
                .password(passwordEncoder.encode(input.password()))
                .createdAt(LocalDateTime.now())
                .build();

        //save via Gateway
        User savedUser = userGateway.save(user);

        //generate token
        String token = tokenGateway.generateToken(savedUser.getEmail());

        return new AuthResponseDto(token, System.currentTimeMillis(), "Signup successful", null);
    }

    private void validateInput(RegisterInputDto input) {
        if (input.username().contains("<") || input.username().contains(">")) {
            throw new IllegalArgumentException("Invalid characters in username.");
        }

        if (!input.username().equals(input.username().trim())) {
            throw new IllegalArgumentException("Username cannot start or end with spaces.");
        }

        if (input.username().contains("  ")) {
            throw new IllegalArgumentException("Username cannot contain repeated spaces.");
        }

        List<String> forbidden = List.of("admin", "root", "system");
        if (forbidden.contains(input.username().toLowerCase())) {
            throw new IllegalArgumentException("Username not allowed.");
        }

        // Password must not include username or email
        String passwordLower = input.password().toLowerCase();
        String usernameLower = input.username().toLowerCase();
        String emailLower = input.email().toLowerCase();

        if (passwordLower.contains(usernameLower)) {
            throw new IllegalArgumentException("Password must not contain username.");
        }

        if (passwordLower.contains(emailLower)) {
            throw new IllegalArgumentException("Password must not contain email.");
        }
    }
}
