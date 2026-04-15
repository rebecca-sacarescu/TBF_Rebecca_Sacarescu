package com.tbf.project.backend.adapters.configuration;

import com.tbf.project.backend.application.service.ProfileCompatibilityCalculator;
import com.tbf.project.backend.application.usecases.*;
import com.tbf.project.backend.application.usecases.impl.*;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.PasswordEncoderGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TokenGateway;
import com.tbf.project.backend.entities.gateway.UserGateway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.tbf.project.backend.entities.gateway.InteractionGateway;

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
    public CreateProfileUseCase createProfileUseCase(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway
    ) {
        return new CreateProfileUseCaseImpl(profileGateway, feedCacheGateway);
    }

    @Bean
    public GetProfileUseCase getProfileUseCase(ProfileGateway profileGateway) {
        return new GetProfileUseCaseImpl(profileGateway);
    }

    @Bean
    public UpdateProfileUseCase updateProfileUseCase(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway
    ) {
        return new UpdateProfileUseCaseImpl(profileGateway, feedCacheGateway);
    }

    @Bean
    public ProfileCompatibilityCalculator profileCompatibilityCalculator() {
        return new ProfileCompatibilityCalculator();
    }

    @Bean
    public GetFeedUseCase getFeedUseCase(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway,
            ProfileCompatibilityCalculator profileCompatibilityCalculator,
            InteractionGateway interactionGateway
    ) {
        return new GetFeedUseCaseImpl(
                profileGateway,
                feedCacheGateway,
                profileCompatibilityCalculator,
                interactionGateway
        );
    }
}