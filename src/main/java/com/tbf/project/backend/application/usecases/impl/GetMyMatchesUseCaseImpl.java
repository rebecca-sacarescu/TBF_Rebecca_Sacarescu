package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.MatchResponseDto;
import com.tbf.project.backend.application.mapper.MatchMapper;
import com.tbf.project.backend.application.service.ProfileCompatibilityCalculator;
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
    private final ProfileCompatibilityCalculator compatibilityCalculator;

    public GetMyMatchesUseCaseImpl(
            MatchGateway matchGateway,
            ProfileGateway profileGateway,
            InteractionGateway interactionGateway,
            ProfileCompatibilityCalculator compatibilityCalculator
    ) {
        this.matchGateway = matchGateway;
        this.profileGateway = profileGateway;
        this.interactionGateway = interactionGateway;
        this.compatibilityCalculator = compatibilityCalculator;
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

            int compatibilityScore = compatibilityCalculator.calculateScore(currentUserProfile, otherProfile);
            boolean superLikeInvolved = isSuperLikeInvolved(currentUserId, otherUserId);

            List<String> badges = buildContextBadges(currentUserProfile, otherProfile, superLikeInvolved);
            String whyYouMatched = buildWhyYouMatched(currentUserProfile, otherProfile, superLikeInvolved);

            MatchResponseDto dto = MatchMapper.toDto(
                    match,
                    otherProfile,
                    compatibilityScore,
                    superLikeInvolved,
                    badges,
                    whyYouMatched
            );

            cards.add(new MatchCard(dto, superLikeInvolved, compatibilityScore, match.getCreatedAt()));
        }

        return cards.stream()
                .sorted(
                        Comparator.comparing(MatchCard::superLikeInvolved).reversed()
                                .thenComparing(MatchCard::compatibilityScore).reversed()
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

    private List<String> buildContextBadges(
            UserProfile currentUser,
            UserProfile otherUser,
            boolean superLikeInvolved
    ) {
        List<String> badges = new ArrayList<>();

        if (currentUser.getBudget() == otherUser.getBudget()) {
            badges.add("Same budget");
        }

        if (currentUser.getPlanningStyle() == otherUser.getPlanningStyle()) {
            badges.add("Same planning style");
        }

        if (currentUser.getSocialBattery() == otherUser.getSocialBattery()) {
            badges.add("Similar social energy");
        }

        int sharedLanguages = overlapCount(currentUser.getLanguages(), otherUser.getLanguages());
        if (sharedLanguages > 0) {
            badges.add(sharedLanguages + " shared language" + (sharedLanguages > 1 ? "s" : ""));
        }

        int sharedActivities = overlapCount(currentUser.getActivities(), otherUser.getActivities());
        if (sharedActivities > 0) {
            badges.add(sharedActivities + " shared activit" + (sharedActivities > 1 ? "ies" : "y"));
        }

        if (superLikeInvolved) {
            badges.add("Super Like");
        }

        return badges;
    }

    private String buildWhyYouMatched(
            UserProfile currentUser,
            UserProfile otherUser,
            boolean superLikeInvolved
    ) {
        List<String> reasons = new ArrayList<>();

        if (currentUser.getBudget() == otherUser.getBudget()) {
            reasons.add("you both prefer the same travel budget");
        }

        if (currentUser.getPlanningStyle() == otherUser.getPlanningStyle()) {
            reasons.add("your planning styles align");
        }

        if (currentUser.getSocialBattery() == otherUser.getSocialBattery()) {
            reasons.add("your social energy is similar");
        }

        int sharedActivities = overlapCount(currentUser.getActivities(), otherUser.getActivities());
        if (sharedActivities > 0) {
            reasons.add("you share " + sharedActivities + " travel activit" + (sharedActivities > 1 ? "ies" : "y"));
        }

        int sharedLanguages = overlapCount(currentUser.getLanguages(), otherUser.getLanguages());
        if (sharedLanguages > 0) {
            reasons.add("you share " + sharedLanguages + " language" + (sharedLanguages > 1 ? "s" : ""));
        }

        if (superLikeInvolved) {
            reasons.add("a Super Like made the connection stand out");
        }

        if (reasons.isEmpty()) {
            return "You showed mutual interest and your travel profiles have enough overlap to make this a promising match.";
        }

        return "You matched because " + String.join(", ", reasons) + ".";
    }

    private int overlapCount(List<String> first, List<String> second) {
        if (first == null || second == null) {
            return 0;
        }

        return (int) first.stream()
                .filter(second::contains)
                .distinct()
                .count();
    }

    private record MatchCard(
            MatchResponseDto dto,
            boolean superLikeInvolved,
            int compatibilityScore,
            java.time.LocalDateTime matchedAt
    ) {
    }
}