package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.AuthResponseDto;
import com.tbf.project.backend.application.dto.LoginInputDto;
import com.tbf.project.backend.application.usecases.LoginUseCase;
import com.tbf.project.backend.entities.gateway.PasswordEncoderGateway;
import com.tbf.project.backend.entities.gateway.TokenGateway;
import com.tbf.project.backend.entities.gateway.UserGateway;
import com.tbf.project.backend.entities.model.User;

public class LoginUseCaseImpl implements LoginUseCase {

    private final UserGateway userGateway;
    private final PasswordEncoderGateway passwordEncoder;
    private final TokenGateway tokenGateway;


    public LoginUseCaseImpl(UserGateway userGateway,
                            PasswordEncoderGateway passwordEncoder,
                            TokenGateway tokenGateway) {
        this.userGateway = userGateway;
        this.passwordEncoder = passwordEncoder;
        this.tokenGateway = tokenGateway;
    }

    @Override
    public AuthResponseDto execute(LoginInputDto input) {
        User user = userGateway.findByEmail(input.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(input.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = tokenGateway.generateToken(user.getEmail());

        return new AuthResponseDto(
                token,
                System.currentTimeMillis() + 3600000,
                "Login successful",
                null
        );
    }
}