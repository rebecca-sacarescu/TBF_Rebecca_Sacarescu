package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.usecases.DeleteMatchUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.model.Match;
import com.tbf.project.backend.entities.model.ProfileInteraction;
import com.tbf.project.backend.entities.model.enums.InteractionType;

public class DeleteMatchUseCaseImpl implements DeleteMatchUseCase {

    private final MatchGateway matchGateway;
    private final FeedCacheGateway feedCacheGateway;
    private final InteractionGateway interactionGateway;

    public DeleteMatchUseCaseImpl(
            MatchGateway matchGateway,
            FeedCacheGateway feedCacheGateway,
            InteractionGateway interactionGateway
    ) {
        this.matchGateway = matchGateway;
        this.feedCacheGateway = feedCacheGateway;
        this.interactionGateway = interactionGateway;
    }

    @Override
    public void execute(Long currentUserId, Long matchId) {
        Match match = matchGateway.findActiveByIdAndUserId(matchId, currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found for current user."));

        Long otherUserId = match.getOtherUserId(currentUserId);

        matchGateway.softDelete(matchId);

        cleanupPositiveInteraction(currentUserId, otherUserId);
        cleanupPositiveInteraction(otherUserId, currentUserId);

        feedCacheGateway.evictFeed(currentUserId);
        feedCacheGateway.evictFeed(otherUserId);
    }

    private void cleanupPositiveInteraction(Long actorUserId, Long targetUserId) {
        interactionGateway.findByActorUserIdAndTargetUserId(actorUserId, targetUserId)
                .map(ProfileInteraction::getInteractionType)
                .filter(this::isPositive)
                .ifPresent(type -> interactionGateway.deleteByActorUserIdAndTargetUserId(actorUserId, targetUserId));
    }

    private boolean isPositive(InteractionType type) {
        return type == InteractionType.YES || type == InteractionType.SUPER_LIKE;
    }
}