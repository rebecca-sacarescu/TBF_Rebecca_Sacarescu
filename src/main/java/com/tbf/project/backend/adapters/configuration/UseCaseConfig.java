package com.tbf.project.backend.adapters.configuration;

import com.tbf.project.backend.application.usecases.LoginUseCase;
import com.tbf.project.backend.application.usecases.RegisterUseCase;
import com.tbf.project.backend.application.usecases.impl.LoginUseCaseImpl;
import com.tbf.project.backend.application.usecases.impl.RegisterUseCaseImpl;
import com.tbf.project.backend.entities.gateway.PasswordEncoderGateway;
import com.tbf.project.backend.entities.gateway.TokenGateway;
import com.tbf.project.backend.entities.gateway.UserGateway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.tbf.project.backend.application.usecases.CreateProfileUseCase;
import com.tbf.project.backend.application.usecases.GetProfileUseCase;
import com.tbf.project.backend.application.usecases.impl.CreateProfileUseCaseImpl;
import com.tbf.project.backend.application.usecases.impl.GetProfileUseCaseImpl;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
@Configuration
public class UseCaseConfig {

    @Bean
    public RegisterUseCase registerUseCase(
            UserGateway userGateway,
            PasswordEncoderGateway passwordEncoderGateway,
            TokenGateway tokenGateway) {

        return new RegisterUseCaseImpl(
                userGateway,
                passwordEncoderGateway,
                tokenGateway
        );
    }

    @Bean
    public LoginUseCase loginUseCase(
            UserGateway userGateway,
            PasswordEncoderGateway passwordEncoderGateway,
            TokenGateway tokenGateway) {

        return new LoginUseCaseImpl(
                userGateway,
                passwordEncoderGateway,
                tokenGateway
        );
    }

    @Bean
    public CreateProfileUseCase createProfileUseCase(ProfileGateway profileGateway) {
        return new CreateProfileUseCaseImpl(profileGateway);
    }

    @Bean
    public GetProfileUseCase getProfileUseCase(ProfileGateway profileGateway) {
        return new GetProfileUseCaseImpl(profileGateway);
    }
}