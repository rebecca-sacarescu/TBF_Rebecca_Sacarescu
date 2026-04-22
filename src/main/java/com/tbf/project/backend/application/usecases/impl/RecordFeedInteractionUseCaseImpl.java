package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.RecordFeedInteractionInputDto;
import com.tbf.project.backend.application.usecases.RecordFeedInteractionUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.SavedProfileGateway;
import com.tbf.project.backend.entities.model.Match;
import com.tbf.project.backend.entities.model.ProfileInteraction;
import com.tbf.project.backend.entities.model.enums.InteractionType;

import java.time.LocalDateTime;

public class RecordFeedInteractionUseCaseImpl implements RecordFeedInteractionUseCase {

    private final InteractionGateway interactionGateway;
    private final ProfileGateway profileGateway;
    private final FeedCacheGateway feedCacheGateway;
    private final MatchGateway matchGateway;
    private final SavedProfileGateway savedProfileGateway;

    public RecordFeedInteractionUseCaseImpl(
            InteractionGateway interactionGateway,
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway,
            MatchGateway matchGateway,
            SavedProfileGateway savedProfileGateway
    ) {
        this.interactionGateway = interactionGateway;
        this.profileGateway = profileGateway;
        this.feedCacheGateway = feedCacheGateway;
        this.matchGateway = matchGateway;
        this.savedProfileGateway = savedProfileGateway;
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

        InteractionType interactionType = parseInteractionType(input.interactionType());

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

        if (interactionType == InteractionType.NO) {
            savedProfileGateway.deleteByActorUserIdAndTargetUserId(actorUserId, targetUserId);
        }

        createMatchIfReciprocalPositive(actorUserId, targetUserId, interactionType);

        feedCacheGateway.evictFeed(actorUserId);
        feedCacheGateway.evictFeed(targetUserId);
    }

    private void createMatchIfReciprocalPositive(Long actorUserId, Long targetUserId, InteractionType currentType) {
        if (!isPositive(currentType)) {
            return;
        }

        boolean reversePositive = interactionGateway
                .findByActorUserIdAndTargetUserId(targetUserId, actorUserId)
                .map(ProfileInteraction::getInteractionType)
                .map(this::isPositive)
                .orElse(false);

        if (!reversePositive) {
            return;
        }

        matchGateway.findActiveByUserPair(actorUserId, targetUserId)
                .orElseGet(() -> {
                    long user1Id = Math.min(actorUserId, targetUserId);
                    long user2Id = Math.max(actorUserId, targetUserId);
                    LocalDateTime now = LocalDateTime.now();

                    savedProfileGateway.deleteByActorUserIdAndTargetUserId(actorUserId, targetUserId);
                    savedProfileGateway.deleteByActorUserIdAndTargetUserId(targetUserId, actorUserId);

                    return matchGateway.save(Match.builder()
                            .user1Id(user1Id)
                            .user2Id(user2Id)
                            .createdAt(now)
                            .updatedAt(now)
                            .build());
                });
    }

    private boolean isPositive(InteractionType type) {
        return type == InteractionType.YES || type == InteractionType.SUPER_LIKE;
    }

    private InteractionType parseInteractionType(String rawValue) {
        try {
            return InteractionType.valueOf(rawValue.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid interaction type: " + rawValue);
        }
    }
}