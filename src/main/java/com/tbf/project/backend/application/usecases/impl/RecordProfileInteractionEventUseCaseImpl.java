package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.RecordProfileInteractionEventInputDto;
import com.tbf.project.backend.application.usecases.RecordProfileInteractionEventUseCase;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.ProfileInteractionEventGateway;
import com.tbf.project.backend.entities.gateway.SavedProfileGateway;
import com.tbf.project.backend.entities.model.ProfileInteractionEvent;
import com.tbf.project.backend.entities.model.enums.InteractionSurface;
import com.tbf.project.backend.entities.model.enums.ProfileInteractionEventType;

import java.time.LocalDateTime;

public class RecordProfileInteractionEventUseCaseImpl implements RecordProfileInteractionEventUseCase {

    private final ProfileGateway profileGateway;
    private final InteractionGateway interactionGateway;
    private final MatchGateway matchGateway;
    private final SavedProfileGateway savedProfileGateway;
    private final ProfileInteractionEventGateway eventGateway;

    public RecordProfileInteractionEventUseCaseImpl(
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
    public void execute(Long actorUserId, Long targetUserId, RecordProfileInteractionEventInputDto input) {
        if (actorUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("A user cannot record events on their own profile.");
        }

        if (!profileGateway.existsByUserId(actorUserId)) {
            throw new IllegalArgumentException("Actor profile not found for user ID: " + actorUserId);
        }

        if (!profileGateway.existsByUserId(targetUserId)) {
            throw new IllegalArgumentException("Target profile not found for user ID: " + targetUserId);
        }

        if (matchGateway.findActiveByUserPair(actorUserId, targetUserId).isPresent()) {
            throw new IllegalArgumentException("Target profile is not available in discovery.");
        }

        boolean hasExplicitInteraction = interactionGateway
                .findByActorUserIdAndTargetUserId(actorUserId, targetUserId)
                .isPresent();

        boolean isSaved = savedProfileGateway.existsByActorUserIdAndTargetUserId(actorUserId, targetUserId);

        if (hasExplicitInteraction && !isSaved) {
            throw new IllegalArgumentException("Target profile is not available in discovery.");
        }

        ProfileInteractionEventType eventType = parseEventType(input.eventType());
        InteractionSurface surface = parseSurface(input.surface());

        if (eventType == ProfileInteractionEventType.DWELL_RECORDED) {
            if (surface != InteractionSurface.FULL_PROFILE) {
                throw new IllegalArgumentException("DWELL_RECORDED is allowed only for FULL_PROFILE.");
            }
            if (input.dwellTimeMs() == null) {
                throw new IllegalArgumentException("dwellTimeMs is required for DWELL_RECORDED.");
            }
        } else if (input.dwellTimeMs() != null) {
            throw new IllegalArgumentException("dwellTimeMs is allowed only for DWELL_RECORDED.");
        }

        ProfileInteractionEvent event = ProfileInteractionEvent.builder()
                .actorUserId(actorUserId)
                .targetUserId(targetUserId)
                .eventType(eventType)
                .surface(surface)
                .dwellTimeMs(input.dwellTimeMs())
                .createdAt(LocalDateTime.now())
                .build();

        eventGateway.save(event);
    }

    private ProfileInteractionEventType parseEventType(String rawValue) {
        try {
            return ProfileInteractionEventType.valueOf(rawValue.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid event type: " + rawValue);
        }
    }

    private InteractionSurface parseSurface(String rawValue) {
        try {
            return InteractionSurface.valueOf(rawValue.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid surface: " + rawValue);
        }
    }
}