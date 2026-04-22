package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.usecases.SaveProfileUseCase;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.ProfileInteractionEventGateway;
import com.tbf.project.backend.entities.gateway.SavedProfileGateway;
import com.tbf.project.backend.entities.model.ProfileInteractionEvent;
import com.tbf.project.backend.entities.model.SavedProfile;
import com.tbf.project.backend.entities.model.enums.InteractionSurface;
import com.tbf.project.backend.entities.model.enums.ProfileInteractionEventType;

import java.time.LocalDateTime;

public class SaveProfileUseCaseImpl implements SaveProfileUseCase {

    private final ProfileGateway profileGateway;
    private final InteractionGateway interactionGateway;
    private final MatchGateway matchGateway;
    private final SavedProfileGateway savedProfileGateway;
    private final ProfileInteractionEventGateway eventGateway;

    public SaveProfileUseCaseImpl(
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway,
            SavedProfileGateway savedProfileGateway,
            ProfileInteractionEventGateway eventGateway
    ) {
        this.profileGateway = profileGateway;
        this.interactionGateway = interactionGateway;
        this.matchGateway = matchGateway;
        this.savedProfileGateway = savedProfileGateway;
        this.eventGateway = eventGateway;
    }

    @Override
    public void execute(Long actorUserId, Long targetUserId) {
        if (actorUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("A user cannot save their own profile.");
        }

        if (!profileGateway.existsByUserId(actorUserId)) {
            throw new IllegalArgumentException("Actor profile not found for user ID: " + actorUserId);
        }

        if (!profileGateway.existsByUserId(targetUserId)) {
            throw new IllegalArgumentException("Target profile not found for user ID: " + targetUserId);
        }

        if (matchGateway.findActiveByUserPair(actorUserId, targetUserId).isPresent()) {
            throw new IllegalArgumentException("Cannot save a profile that is already matched.");
        }

        if (interactionGateway.findByActorUserIdAndTargetUserId(actorUserId, targetUserId).isPresent()) {
            throw new IllegalArgumentException("Cannot save a profile that already has an explicit interaction.");
        }

        if (savedProfileGateway.existsByActorUserIdAndTargetUserId(actorUserId, targetUserId)) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        savedProfileGateway.save(SavedProfile.builder()
                .actorUserId(actorUserId)
                .targetUserId(targetUserId)
                .createdAt(now)
                .updatedAt(now)
                .build());

        eventGateway.save(ProfileInteractionEvent.builder()
                .actorUserId(actorUserId)
                .targetUserId(targetUserId)
                .eventType(ProfileInteractionEventType.SAVE)
                .surface(InteractionSurface.FEED_CARD)
                .createdAt(now)
                .build());
    }
}