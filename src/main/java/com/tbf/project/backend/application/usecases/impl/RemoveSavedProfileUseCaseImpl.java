package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.usecases.RemoveSavedProfileUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.ProfileInteractionEventGateway;
import com.tbf.project.backend.entities.gateway.SavedProfileGateway;
import com.tbf.project.backend.entities.model.ProfileInteractionEvent;
import com.tbf.project.backend.entities.model.enums.InteractionSurface;
import com.tbf.project.backend.entities.model.enums.ProfileInteractionEventType;

import java.time.LocalDateTime;

public class RemoveSavedProfileUseCaseImpl implements RemoveSavedProfileUseCase {

    private final ProfileGateway profileGateway;
    private final SavedProfileGateway savedProfileGateway;
    private final ProfileInteractionEventGateway eventGateway;

    public RemoveSavedProfileUseCaseImpl(
            ProfileGateway profileGateway,
            SavedProfileGateway savedProfileGateway,
            ProfileInteractionEventGateway eventGateway
    ) {
        this.profileGateway = profileGateway;
        this.savedProfileGateway = savedProfileGateway;
        this.eventGateway = eventGateway;
    }

    @Override
    public void execute(Long actorUserId, Long targetUserId) {
        if (actorUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("A user cannot unsave their own profile.");
        }

        if (!profileGateway.existsByUserId(actorUserId)) {
            throw new IllegalArgumentException("Actor profile not found for user ID: " + actorUserId);
        }

        if (!profileGateway.existsByUserId(targetUserId)) {
            throw new IllegalArgumentException("Target profile not found for user ID: " + targetUserId);
        }

        if (!savedProfileGateway.existsByActorUserIdAndTargetUserId(actorUserId, targetUserId)) {
            return;
        }

        savedProfileGateway.deleteByActorUserIdAndTargetUserId(actorUserId, targetUserId);

        eventGateway.save(ProfileInteractionEvent.builder()
                .actorUserId(actorUserId)
                .targetUserId(targetUserId)
                .eventType(ProfileInteractionEventType.UNSAVE)
                .surface(InteractionSurface.FEED_CARD)
                .createdAt(LocalDateTime.now())
                .build());
    }
}