package com.tbf.project.backend.adapters.persistence.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbf.project.backend.entities.gateway.CrewCompatibilityCacheGateway;
import com.tbf.project.backend.entities.model.TripCrewCompatibility;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CrewCompatibilityCacheGatewayImpl implements CrewCompatibilityCacheGateway {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration TTL = Duration.ofHours(1);
    private static final String PREFIX = "crew-compat:trip:";

    @Override
    public void put(Long tripId, Long candidateUserId, TripCrewCompatibility compatibility) {
        String key = buildKey(tripId, candidateUserId);
        try {
            String json = objectMapper.writeValueAsString(compatibility);
            redisTemplate.opsForValue().set(key, json, TTL);
        } catch (JsonProcessingException ignored) {
        }
    }

    @Override
    public Optional<TripCrewCompatibility> get(Long tripId, Long candidateUserId) {
        String key = buildKey(tripId, candidateUserId);
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(json, TripCrewCompatibility.class));
        } catch (JsonProcessingException e) {
            return Optional.empty();
        }
    }

    @Override
    public void evictByTripId(Long tripId) {
        String pattern = PREFIX + tripId + ":user:*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private String buildKey(Long tripId, Long candidateUserId) {
        return PREFIX + tripId + ":user:" + candidateUserId;
    }
}