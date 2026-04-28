package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.TripCrewInsightsResponseDto;
import com.tbf.project.backend.application.dto.TripCrewTopAttributeDto;
import com.tbf.project.backend.application.usecases.GetTripCrewInsightsUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.Budget;
import com.tbf.project.backend.entities.model.enums.PlanningStyle;
import com.tbf.project.backend.entities.model.enums.SocialBattery;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class GetTripCrewInsightsUseCaseImpl implements GetTripCrewInsightsUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;

    public GetTripCrewInsightsUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.profileGateway = profileGateway;
    }

    @Override
    public TripCrewInsightsResponseDto execute(Long currentUserId, Long tripId) {
        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        if (!tripMemberGateway.existsActiveByTripIdAndUserId(tripId, currentUserId)) {
            throw new SecurityException("You are not a member of this trip");
        }

        List<TripMember> members = tripMemberGateway.findAllActiveByTripId(tripId);

        List<Long> memberUserIds = members.stream()
                .map(TripMember::getUserId)
                .toList();

        List<UserProfile> profiles = profileGateway.findAllByUserIds(memberUserIds);

        int groupSize = members.size();
        int spotsLeft = Math.max(0, trip.getTargetGroupSize() - groupSize);

        Budget dominantBudget = mostCommon(
                profiles.stream()
                        .map(UserProfile::getBudget)
                        .filter(Objects::nonNull)
                        .toList()
        );

        PlanningStyle dominantPlanningStyle = mostCommon(
                profiles.stream()
                        .map(UserProfile::getPlanningStyle)
                        .filter(Objects::nonNull)
                        .toList()
        );

        SocialBattery dominantSocialBattery = mostCommon(
                profiles.stream()
                        .map(UserProfile::getSocialBattery)
                        .filter(Objects::nonNull)
                        .toList()
        );

        List<TripCrewTopAttributeDto> topLanguages = topAttributes(
                profiles.stream()
                        .flatMap(profile -> safeList(profile.getLanguages()).stream())
                        .toList()
        );

        List<TripCrewTopAttributeDto> topActivities = topAttributes(
                profiles.stream()
                        .flatMap(profile -> safeList(profile.getActivities()).stream())
                        .toList()
        );

        String groupVibe = buildGroupVibe(dominantBudget, dominantPlanningStyle, dominantSocialBattery);
        List<String> insights = buildInsights(
                groupSize,
                trip.getTargetGroupSize(),
                dominantBudget,
                dominantPlanningStyle,
                dominantSocialBattery,
                topLanguages,
                topActivities
        );

        return new TripCrewInsightsResponseDto(
                trip.getId(),
                groupSize,
                trip.getTargetGroupSize(),
                spotsLeft,
                dominantBudget != null ? dominantBudget.name() : null,
                dominantPlanningStyle != null ? dominantPlanningStyle.name() : null,
                dominantSocialBattery != null ? dominantSocialBattery.name() : null,
                topLanguages,
                topActivities,
                groupVibe,
                insights
        );
    }

    private <T> T mostCommon(List<T> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }

        return values.stream()
                .collect(Collectors.groupingBy(value -> value, Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private List<TripCrewTopAttributeDto> topAttributes(List<String> values) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }

        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.groupingBy(value -> value, Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(entry -> new TripCrewTopAttributeDto(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private String buildGroupVibe(
            Budget dominantBudget,
            PlanningStyle dominantPlanningStyle,
            SocialBattery dominantSocialBattery
    ) {
        List<String> parts = new ArrayList<>();

        if (dominantPlanningStyle != null) {
            parts.add(formatEnum(dominantPlanningStyle.name()) + " planning");
        }

        if (dominantBudget != null) {
            parts.add(formatEnum(dominantBudget.name()) + " budget");
        }

        if (dominantSocialBattery != null) {
            parts.add(formatEnum(dominantSocialBattery.name()) + " social energy");
        }

        if (parts.isEmpty()) {
            return "A mixed travel crew with diverse preferences";
        }

        return String.join(", ", parts) + " crew";
    }

    private List<String> buildInsights(
            int groupSize,
            int targetGroupSize,
            Budget dominantBudget,
            PlanningStyle dominantPlanningStyle,
            SocialBattery dominantSocialBattery,
            List<TripCrewTopAttributeDto> topLanguages,
            List<TripCrewTopAttributeDto> topActivities
    ) {
        List<String> insights = new ArrayList<>();

        insights.add("This trip currently has " + groupSize + " out of " + targetGroupSize + " spots filled.");

        if (dominantPlanningStyle != null) {
            insights.add("Most members prefer " + formatEnum(dominantPlanningStyle.name()) + " planning.");
        }

        if (dominantBudget != null) {
            insights.add("The group budget is mostly " + formatEnum(dominantBudget.name()) + ".");
        }

        if (dominantSocialBattery != null) {
            insights.add("The crew's dominant social rhythm is " + formatEnum(dominantSocialBattery.name()) + ".");
        }

        if (!topLanguages.isEmpty()) {
            TripCrewTopAttributeDto topLanguage = topLanguages.get(0);
            insights.add(topLanguage.name() + " is the strongest shared language in this crew.");
        }

        if (!topActivities.isEmpty()) {
            TripCrewTopAttributeDto topActivity = topActivities.get(0);
            insights.add("A popular shared activity is " + topActivity.name() + ".");
        }

        return insights;
    }

    private String formatEnum(String value) {
        return value.toLowerCase().replace("_", " ");
    }
}