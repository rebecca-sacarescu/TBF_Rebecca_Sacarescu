package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class RedisFeedCacheGatewayImpl implements FeedCacheGateway {

    private final StringRedisTemplate redisTemplate;

    @Value("${feed.cache.ttl-minutes}")
    private long feedCacheTtlMinutes;

    @Override
    public List<Long> getFeedCandidateIds(Long userId, int page, int size) {
        String key = buildKey(userId);

        long start = (long) page * size;
        long end = start + size - 1;

        Set<String> values = redisTemplate.opsForZSet().reverseRange(key, start, end);

        if (values == null || values.isEmpty()) {
            return List.of();
        }

        List<Long> candidateIds = new ArrayList<>();
        for (String value : values) {
            candidateIds.add(Long.valueOf(value));
        }

        return candidateIds;
    }

    @Override
    public void saveFeedRanking(Long userId, List<CandidateScore> rankedCandidates) {
        String key = buildKey(userId);

        redisTemplate.delete(key);

        for (CandidateScore candidate : rankedCandidates) {
            redisTemplate.opsForZSet().add(
                    key,
                    String.valueOf(candidate.candidateUserId()),
                    candidate.score()
            );
        }

        redisTemplate.expire(key, Duration.ofMinutes(feedCacheTtlMinutes));
    }

    @Override
    public void evictFeed(Long userId) {
        redisTemplate.delete(buildKey(userId));
    }

    private String buildKey(Long userId) {
        return "feed:user:" + userId;
    }
}