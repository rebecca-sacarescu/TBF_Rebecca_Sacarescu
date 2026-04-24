package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.FeedItemResponseDto;
import com.tbf.project.backend.application.dto.ReciprocalCompatibilityResult;
import com.tbf.project.backend.application.mapper.FeedMapper;
import com.tbf.project.backend.application.service.ReciprocalCompatibilityCalculator;
import com.tbf.project.backend.application.usecases.GetFeedUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class GetFeedUseCaseImpl implements GetFeedUseCase {

    private final ProfileGateway profileGateway;
    private final FeedCacheGateway feedCacheGateway;
    private final ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator;
    private final InteractionGateway interactionGateway;
    private final MatchGateway matchGateway;

    public GetFeedUseCaseImpl(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway,
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator,
            InteractionGateway interactionGateway,
            MatchGateway matchGateway
    ) {
        this.profileGateway = profileGateway;
        this.feedCacheGateway = feedCacheGateway;
        this.reciprocalCompatibilityCalculator = reciprocalCompatibilityCalculator;
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
                .map((UserProfile candidate) -> {
                    ReciprocalCompatibilityResult result =
                            reciprocalCompatibilityCalculator.calculate(currentUserProfile, candidate);
                    return new ScoredProfile(candidate, result);
                })
                .sorted(Comparator.<ScoredProfile>comparingInt(item -> item.result().reciprocalScore100()).reversed())
                .toList();

        List<FeedCacheGateway.CandidateScore> ranking = scoredProfiles.stream()
                .map(item -> new FeedCacheGateway.CandidateScore(
                        item.profile().getUserId(),
                        item.result().reciprocalScore100()
                ))
                .toList();

        feedCacheGateway.saveFeedRanking(currentUserId, ranking);

        return scoredProfiles.stream()
                .skip((long) page * size)
                .limit(size)
                .map(item -> FeedMapper.toFeedItemDto(item.profile(), item.result()))
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
                ReciprocalCompatibilityResult compatibilityResult =
                        reciprocalCompatibilityCalculator.calculate(currentUserProfile, candidate);

                result.add(FeedMapper.toFeedItemDto(candidate, compatibilityResult));
            }
        }

        return result;
    }

    private record ScoredProfile(UserProfile profile, ReciprocalCompatibilityResult result) {
    }
}