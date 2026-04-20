package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.usecases.DeleteMatchUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.model.Match;

public class DeleteMatchUseCaseImpl implements DeleteMatchUseCase {

    private final MatchGateway matchGateway;
    private final FeedCacheGateway feedCacheGateway;

    public DeleteMatchUseCaseImpl(
            MatchGateway matchGateway,
            FeedCacheGateway feedCacheGateway
    ) {
        this.matchGateway = matchGateway;
        this.feedCacheGateway = feedCacheGateway;
    }

    @Override
    public void execute(Long currentUserId, Long matchId) {
        Match match = matchGateway.findActiveByIdAndUserId(matchId, currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found for current user."));

        matchGateway.softDelete(matchId);

        feedCacheGateway.evictFeed(currentUserId);
        feedCacheGateway.evictFeed(match.getOtherUserId(currentUserId));
    }
}