package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.FeedItemResponseDto;
import com.tbf.project.backend.application.mapper.FeedMapper;
import com.tbf.project.backend.application.service.ProfileCompatibilityCalculator;
import com.tbf.project.backend.application.usecases.GetFeedUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.Match;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class GetFeedUseCaseImpl implements GetFeedUseCase {

    private final ProfileGateway profileGateway;
    private final FeedCacheGateway feedCacheGateway;
    private final ProfileCompatibilityCalculator compatibilityCalculator;
    private final InteractionGateway interactionGateway;
    private final MatchGateway matchGateway;

    public GetFeedUseCaseImpl(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway,
            ProfileCompatibilityCalculator compatibilityCalculator,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway
    ) {
        this.profileGateway = profileGateway;
        this.feedCacheGateway = feedCacheGateway;
        this.compatibilityCalculator = compatibilityCalculator;
        this.interactionGateway = interactionGateway;
        this.matchGateway = matchGateway;
    }

    @Override
    public List<FeedItemResponseDto> execute(Long currentUserId, int page, int size) {
        UserProfile currentUserProfile = profileGateway.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + currentUserId));

        List<Long> cachedCandidateIds = feedCacheGateway.getFeedCandidateIds(currentUserId, page, size);

        if (!cachedCandidateIds.isEmpty()) {
            return buildFeedFromCachedIds(currentUserProfile, cachedCandidateIds);
        }

        List<Long> alreadyInteractedUserIds = interactionGateway.findTargetUserIdsByActorUserId(currentUserId);
        List<Long> matchedUserIds = matchGateway.findActiveByUserId(currentUserId).stream()
                .map(match -> match.getOtherUserId(currentUserId))
                .toList();

        Set<Long> excludedUserIds = new HashSet<>();
        excludedUserIds.addAll(alreadyInteractedUserIds);
        excludedUserIds.addAll(matchedUserIds);

        List<UserProfile> candidates = profileGateway.findAllExceptUserId(currentUserId).stream()
                .filter(candidate -> !excludedUserIds.contains(candidate.getUserId()))
                .toList();

        List<ScoredProfile> scoredProfiles = candidates.stream()
                .map(candidate -> new ScoredProfile(
                        candidate,
                        compatibilityCalculator.calculateScore(currentUserProfile, candidate)
                ))
                .sorted(Comparator.comparingInt(ScoredProfile::score).reversed())
                .toList();

        List<FeedCacheGateway.CandidateScore> ranking = scoredProfiles.stream()
                .map(item -> new FeedCacheGateway.CandidateScore(
                        item.profile().getUserId(),
                        item.score()
                ))
                .toList();

        feedCacheGateway.saveFeedRanking(currentUserId, ranking);

        return scoredProfiles.stream()
                .skip((long) page * size)
                .limit(size)
                .map(item -> FeedMapper.toFeedItemDto(item.profile(), item.score()))
                .toList();
    }

    private List<FeedItemResponseDto> buildFeedFromCachedIds(
            UserProfile currentUserProfile,
            List<Long> cachedCandidateIds
    ) {
        List<UserProfile> cachedProfiles = profileGateway.findAllByUserIds(cachedCandidateIds);

        Map<Long, UserProfile> profilesByUserId = cachedProfiles.stream()
                .collect(Collectors.toMap(UserProfile::getUserId, Function.identity()));

        List<FeedItemResponseDto> result = new ArrayList<>();

        for (Long candidateId : cachedCandidateIds) {
            UserProfile candidate = profilesByUserId.get(candidateId);

            if (candidate != null) {
                int score = compatibilityCalculator.calculateScore(currentUserProfile, candidate);
                result.add(FeedMapper.toFeedItemDto(candidate, score));
            }
        }

        return result;
    }

    private record ScoredProfile(UserProfile profile, int score) {
    }
}