package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.DiscoverProfileResponseDto;
import com.tbf.project.backend.application.mapper.DiscoverMapper;
import com.tbf.project.backend.application.service.ProfileCompatibilityCalculator;
import com.tbf.project.backend.application.usecases.GetDiscoverProfileUseCase;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.SavedProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;

public class GetDiscoverProfileUseCaseImpl implements GetDiscoverProfileUseCase {

    private final ProfileGateway profileGateway;
    private final InteractionGateway interactionGateway;
    private final MatchGateway matchGateway;
    private final SavedProfileGateway savedProfileGateway;
    private final ProfileCompatibilityCalculator compatibilityCalculator;

    public GetDiscoverProfileUseCaseImpl(
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway,
            SavedProfileGateway savedProfileGateway,
            ProfileCompatibilityCalculator compatibilityCalculator
    ) {
        this.profileGateway = profileGateway;
        this.interactionGateway = interactionGateway;
        this.matchGateway = matchGateway;
        this.savedProfileGateway = savedProfileGateway;
        this.compatibilityCalculator = compatibilityCalculator;
    }

    @Override
    public DiscoverProfileResponseDto execute(Long actorUserId, Long targetUserId) {
        if (actorUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("A user cannot discover their own profile.");
        }

        UserProfile actorProfile = profileGateway.findById(actorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Actor profile not found for user ID: " + actorUserId));

        UserProfile targetProfile = profileGateway.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target profile not found for user ID: " + targetUserId));

        if (matchGateway.findActiveByUserPair(actorUserId, targetUserId).isPresent()) {
            throw new IllegalArgumentException("Target profile is not available in discovery.");
        }

        boolean hasExplicitInteraction = interactionGateway
                .findByActorUserIdAndTargetUserId(actorUserId, targetUserId)
                .isPresent();

        boolean isSaved = savedProfileGateway.existsByActorUserIdAndTargetUserId(actorUserId, targetUserId);

        if (hasExplicitInteraction) {
            throw new IllegalArgumentException("Target profile is not available in discovery.");
        }

        int compatibilityScore = compatibilityCalculator.calculateScore(actorProfile, targetProfile);

        return DiscoverMapper.toDto(targetProfile, compatibilityScore, isSaved);
    }
}