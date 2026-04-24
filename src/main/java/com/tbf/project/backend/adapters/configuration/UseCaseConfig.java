package com.tbf.project.backend.adapters.configuration;

import com.tbf.project.backend.application.service.CompatibilityExplanationService;
import com.tbf.project.backend.application.service.CompatibilityPenaltyCalculator;
import com.tbf.project.backend.application.service.DirectionalProfileSimilarityCalculator;
import com.tbf.project.backend.application.service.ProfileVectorizer;
import com.tbf.project.backend.application.service.ReciprocalCompatibilityCalculator;
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
    public ProfileVectorizer profileVectorizer() {
        return new ProfileVectorizer();
    }

    @Bean
    public DirectionalProfileSimilarityCalculator directionalProfileSimilarityCalculator(
            ProfileVectorizer profileVectorizer
    ) {
        return new DirectionalProfileSimilarityCalculator(profileVectorizer);
    }

    @Bean
    public CompatibilityPenaltyCalculator compatibilityPenaltyCalculator(
            ProfileVectorizer profileVectorizer
    ) {
        return new CompatibilityPenaltyCalculator(profileVectorizer);
    }

    @Bean
    public ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator(
            DirectionalProfileSimilarityCalculator directionalProfileSimilarityCalculator,
            CompatibilityPenaltyCalculator compatibilityPenaltyCalculator
    ) {
        return new ReciprocalCompatibilityCalculator(
                directionalProfileSimilarityCalculator,
                compatibilityPenaltyCalculator
        );
    }

    @Bean
    public CompatibilityExplanationService compatibilityExplanationService(
            ProfileVectorizer profileVectorizer
    ) {
        return new CompatibilityExplanationService(profileVectorizer);
    }

    @Bean
    public GetFeedUseCase getFeedUseCase(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway,
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway
    ) {
        return new GetFeedUseCaseImpl(
                profileGateway,
                feedCacheGateway,
                reciprocalCompatibilityCalculator,
                interactionGateway,
                matchGateway
        );
    }

    @Bean
    public RecordFeedInteractionUseCase recordFeedInteractionUseCase(
            InteractionGateway interactionGateway,
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway,
            MatchGateway matchGateway,
            SavedProfileGateway savedProfileGateway
    ) {
        return new RecordFeedInteractionUseCaseImpl(
                interactionGateway,
                profileGateway,
                feedCacheGateway,
                matchGateway,
                savedProfileGateway
        );
    }

    @Bean
    public GetMyMatchesUseCase getMyMatchesUseCase(
            MatchGateway matchGateway,
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator,
            CompatibilityExplanationService compatibilityExplanationService
    ) {
        return new GetMyMatchesUseCaseImpl(
                matchGateway,
                profileGateway,
                interactionGateway,
                reciprocalCompatibilityCalculator,
                compatibilityExplanationService
        );
    }

    @Bean
    public DeleteMatchUseCase deleteMatchUseCase(
            MatchGateway matchGateway,
            FeedCacheGateway feedCacheGateway,
            InteractionGateway interactionGateway
    ) {
        return new DeleteMatchUseCaseImpl(
                matchGateway,
                feedCacheGateway,
                interactionGateway
        );
    }

    @Bean
    public GetDiscoverProfileUseCase getDiscoverProfileUseCase(
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway,
            SavedProfileGateway savedProfileGateway,
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator
    ) {
        return new GetDiscoverProfileUseCaseImpl(
                profileGateway,
                interactionGateway,
                matchGateway,
                savedProfileGateway,
                reciprocalCompatibilityCalculator
        );
    }

    @Bean
    public RecordProfileInteractionEventUseCase recordProfileInteractionEventUseCase(
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway,
            SavedProfileGateway savedProfileGateway,
            ProfileInteractionEventGateway profileInteractionEventGateway
    ) {
        return new RecordProfileInteractionEventUseCaseImpl(
                profileGateway,
                interactionGateway,
                matchGateway,
                savedProfileGateway,
                profileInteractionEventGateway
        );
    }

    @Bean
    public SaveProfileUseCase saveProfileUseCase(
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway,
            SavedProfileGateway savedProfileGateway,
            ProfileInteractionEventGateway profileInteractionEventGateway
    ) {
        return new SaveProfileUseCaseImpl(
                profileGateway,
                interactionGateway,
                matchGateway,
                savedProfileGateway,
                profileInteractionEventGateway
        );
    }

    @Bean
    public RemoveSavedProfileUseCase removeSavedProfileUseCase(
            ProfileGateway profileGateway,
            SavedProfileGateway savedProfileGateway,
            ProfileInteractionEventGateway profileInteractionEventGateway
    ) {
        return new RemoveSavedProfileUseCaseImpl(
                profileGateway,
                savedProfileGateway,
                profileInteractionEventGateway
        );
    }

    @Bean
    public GetSavedProfilesUseCase getSavedProfilesUseCase(
            ProfileGateway profileGateway,
            SavedProfileGateway savedProfileGateway,
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator
    ) {
        return new GetSavedProfilesUseCaseImpl(
                profileGateway,
                savedProfileGateway,
                reciprocalCompatibilityCalculator
        );
    }

    @Bean
    public CreateTripUseCase createTripUseCase(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway
    ) {
        return new CreateTripUseCaseImpl(
                tripGateway,
                tripMemberGateway,
                profileGateway
        );
    }

    @Bean
    public GetJoinableTripsUseCase getJoinableTripsUseCase(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            ProfileGateway profileGateway
    ) {
        return new GetJoinableTripsUseCaseImpl(
                tripGateway,
                tripMemberGateway,
                tripJoinRequestGateway,
                profileGateway
        );
    }

    @Bean
    public RequestToJoinTripUseCase requestToJoinTripUseCase(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            ProfileGateway profileGateway
    ) {
        return new RequestToJoinTripUseCaseImpl(
                tripGateway,
                tripMemberGateway,
                tripJoinRequestGateway,
                profileGateway
        );
    }

    @Bean
    public GetMyCreatedTripsUseCase getMyCreatedTripsUseCase(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway
    ) {
        return new GetMyCreatedTripsUseCaseImpl(
                tripGateway,
                tripMemberGateway,
                profileGateway
        );
    }

    @Bean
    public GetMyJoinedTripsUseCase getMyJoinedTripsUseCase(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway
    ) {
        return new GetMyJoinedTripsUseCaseImpl(
                tripGateway,
                tripMemberGateway,
                profileGateway
        );
    }

    @Bean
    public GetTripJoinRequestsUseCase getTripJoinRequestsUseCase(
            TripGateway tripGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            ProfileGateway profileGateway
    ) {
        return new GetTripJoinRequestsUseCaseImpl(
                tripGateway,
                tripJoinRequestGateway,
                profileGateway
        );
    }

    @Bean
    public ApproveTripJoinRequestUseCase approveTripJoinRequestUseCase(
            TripGateway tripGateway,
            TripJoinRequestGateway tripJoinRequestGateway,
            TripMemberGateway tripMemberGateway
    ) {
        return new ApproveTripJoinRequestUseCaseImpl(
                tripGateway,
                tripJoinRequestGateway,
                tripMemberGateway
        );
    }

    @Bean
    public RejectTripJoinRequestUseCase rejectTripJoinRequestUseCase(
            TripGateway tripGateway,
            TripJoinRequestGateway tripJoinRequestGateway
    ) {
        return new RejectTripJoinRequestUseCaseImpl(
                tripGateway,
                tripJoinRequestGateway
        );
    }
}