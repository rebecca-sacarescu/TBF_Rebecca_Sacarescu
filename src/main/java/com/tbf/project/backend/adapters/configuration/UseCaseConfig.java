package com.tbf.project.backend.adapters.configuration;

import com.tbf.project.backend.application.service.ProfileCompatibilityCalculator;
import com.tbf.project.backend.application.usecases.*;
import com.tbf.project.backend.application.usecases.impl.*;
import com.tbf.project.backend.entities.gateway.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    @Bean
    public RegisterUseCase registerUseCase(
            UserGateway userGateway,
            PasswordEncoderGateway passwordEncoderGateway,
            TokenGateway tokenGateway
    ) {
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
            TokenGateway tokenGateway
    ) {
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
            InteractionGateway interactionGateway,
            MatchGateway matchGateway
    ) {
        return new GetFeedUseCaseImpl(
                profileGateway,
                feedCacheGateway,
                profileCompatibilityCalculator,
                interactionGateway,
                matchGateway
        );
    }

    @Bean
    public RecordFeedInteractionUseCase recordFeedInteractionUseCase(
            InteractionGateway interactionGateway,
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway,
            MatchGateway matchGateway
    ) {
        return new RecordFeedInteractionUseCaseImpl(
                interactionGateway,
                profileGateway,
                feedCacheGateway,
                matchGateway
        );
    }

    @Bean
    public GetMyMatchesUseCase getMyMatchesUseCase(
            MatchGateway matchGateway,
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            ProfileCompatibilityCalculator profileCompatibilityCalculator
    ) {
        return new GetMyMatchesUseCaseImpl(
                matchGateway,
                profileGateway,
                interactionGateway,
                profileCompatibilityCalculator
        );
    }

    @Bean
    public DeleteMatchUseCase deleteMatchUseCase(
            MatchGateway matchGateway,
            FeedCacheGateway feedCacheGateway
    ) {
        return new DeleteMatchUseCaseImpl(
                matchGateway,
                feedCacheGateway
        );
    }
}