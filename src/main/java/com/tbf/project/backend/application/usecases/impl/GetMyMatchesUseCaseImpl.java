package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.MatchResponseDto;
import com.tbf.project.backend.application.dto.ReciprocalCompatibilityResult;
import com.tbf.project.backend.application.mapper.MatchMapper;
import com.tbf.project.backend.application.service.CompatibilityExplanationService;
import com.tbf.project.backend.application.service.ReciprocalCompatibilityCalculator;
import com.tbf.project.backend.application.usecases.GetMyMatchesUseCase;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.Match;
import com.tbf.project.backend.entities.model.ProfileInteraction;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.InteractionType;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public class GetMyMatchesUseCaseImpl implements GetMyMatchesUseCase {

    private final MatchGateway matchGateway;
    private final ProfileGateway profileGateway;
    private final InteractionGateway interactionGateway;
    private final ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator;
    private final CompatibilityExplanationService compatibilityExplanationService;

    public GetMyMatchesUseCaseImpl(
            MatchGateway matchGateway,
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator,
            CompatibilityExplanationService compatibilityExplanationService
    ) {
        this.matchGateway = matchGateway;
        this.profileGateway = profileGateway;
        this.interactionGateway = interactionGateway;
        this.reciprocalCompatibilityCalculator = reciprocalCompatibilityCalculator;
        this.compatibilityExplanationService = compatibilityExplanationService;
    }

    @Override
    public List<MatchResponseDto> execute(Long currentUserId) {
        UserProfile currentUserProfile = profileGateway.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + currentUserId));

        List<Match> matches = matchGateway.findActiveByUserId(currentUserId);

        List<Long> otherUserIds = matches.stream()
                .map(match -> match.getOtherUserId(currentUserId))
                .toList();

        Map<Long, UserProfile> profilesByUserId = profileGateway.findAllByUserIds(otherUserIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, Function.identity()));

        List<MatchCard> cards = new ArrayList<>();

        for (Match match : matches) {
            Long otherUserId = match.getOtherUserId(currentUserId);
            UserProfile otherProfile = profilesByUserId.get(otherUserId);

            if (otherProfile == null) {
                continue;
            }

            ReciprocalCompatibilityResult compatibilityResult =
                    reciprocalCompatibilityCalculator.calculate(currentUserProfile, otherProfile);

            boolean superLikeInvolved = isSuperLikeInvolved(currentUserId, otherUserId);

            List<String> badges = compatibilityExplanationService.buildContextBadges(
                    currentUserProfile,
                    otherProfile,
                    compatibilityResult,
                    superLikeInvolved
            );

            String whyYouMatched = compatibilityExplanationService.buildWhyYouMatched(
                    currentUserProfile,
                    otherProfile,
                    compatibilityResult,
                    superLikeInvolved
            );

            MatchResponseDto dto = MatchMapper.toDto(
                    match,
                    otherProfile,
                    compatibilityResult.reciprocalScore100(),
                    superLikeInvolved,
                    badges,
                    whyYouMatched
            );

            cards.add(new MatchCard(
                    dto,
                    superLikeInvolved,
                    compatibilityResult.reciprocalScore100(),
                    match.getCreatedAt()
            ));
        }

        return cards.stream()
                .sorted(
                        Comparator.comparing(MatchCard::superLikeInvolved).reversed()
                                .thenComparing(MatchCard::reciprocalCompatibilityScore).reversed()
                                .thenComparing(MatchCard::matchedAt).reversed()
                )
                .map(MatchCard::dto)
                .toList();
    }

    private boolean isSuperLikeInvolved(Long currentUserId, Long otherUserId) {
        Optional<ProfileInteraction> direct = interactionGateway.findByActorUserIdAndTargetUserId(currentUserId, otherUserId);
        Optional<ProfileInteraction> reverse = interactionGateway.findByActorUserIdAndTargetUserId(otherUserId, currentUserId);

        return direct.map(ProfileInteraction::getInteractionType).orElse(null) == InteractionType.SUPER_LIKE
                || reverse.map(ProfileInteraction::getInteractionType).orElse(null) == InteractionType.SUPER_LIKE;
    }

    private record MatchCard(
            MatchResponseDto dto,
            boolean superLikeInvolved,
            int reciprocalCompatibilityScore,
            java.time.LocalDateTime matchedAt
    ) {
    }
}