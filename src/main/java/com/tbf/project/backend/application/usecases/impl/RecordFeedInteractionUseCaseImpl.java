package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.RecordFeedInteractionInputDto;
import com.tbf.project.backend.application.usecases.RecordFeedInteractionUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.ProfileInteraction;
import com.tbf.project.backend.entities.model.enums.InteractionType;

import java.time.LocalDateTime;

public class RecordFeedInteractionUseCaseImpl implements RecordFeedInteractionUseCase {

    private final InteractionGateway interactionGateway;
    private final ProfileGateway profileGateway;
    private final FeedCacheGateway feedCacheGateway;

    public RecordFeedInteractionUseCaseImpl(
            InteractionGateway interactionGateway,
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway
    ) {
        this.interactionGateway = interactionGateway;
        this.profileGateway = profileGateway;
        this.feedCacheGateway = feedCacheGateway;
    }

    @Override
    public void execute(Long actorUserId, RecordFeedInteractionInputDto input) {
        Long targetUserId = input.targetUserId();

        if (actorUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("A user cannot interact with their own profile.");
        }

        if (!profileGateway.existsByUserId(actorUserId)) {
            throw new IllegalArgumentException("Actor profile not found for user ID: " + actorUserId);
        }

        if (!profileGateway.existsByUserId(targetUserId)) {
            throw new IllegalArgumentException("Target profile not found for user ID: " + targetUserId);
        }

        InteractionType interactionType = InteractionType.valueOf(input.interactionType());

        ProfileInteraction interaction = interactionGateway
                .findByActorUserIdAndTargetUserId(actorUserId, targetUserId)
                .map(existing -> {
                    existing.setInteractionType(interactionType);
                    existing.setUpdatedAt(LocalDateTime.now());
                    return existing;
                })
                .orElseGet(() -> ProfileInteraction.builder()
                        .actorUserId(actorUserId)
                        .targetUserId(targetUserId)
                        .interactionType(interactionType)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());

        interactionGateway.save(interaction);

        feedCacheGateway.evictFeed(actorUserId);
    }
}