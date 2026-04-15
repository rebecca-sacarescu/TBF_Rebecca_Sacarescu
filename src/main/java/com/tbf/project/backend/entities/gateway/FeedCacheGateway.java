package com.tbf.project.backend.entities.gateway;

import java.util.List;

public interface FeedCacheGateway {

    List<Long> getFeedCandidateIds(Long userId, int page, int size);

    void saveFeedRanking(Long userId, List<CandidateScore> rankedCandidates);

    void evictFeed(Long userId);

    record CandidateScore(Long candidateUserId, double score) {
    }
}