package com.tbf.project.backend.application.mapper;

import com.tbf.project.backend.application.dto.FeedItemResponseDto;
import com.tbf.project.backend.entities.model.UserProfile;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

public class FeedMapper {

    private FeedMapper() {
    }

    public static FeedItemResponseDto toFeedItemDto(UserProfile profile, int compatibilityScore) {
        int age = Period.between(profile.getBirthDate(), LocalDate.now()).getYears();

        return new FeedItemResponseDto(
                profile.getUserId(),
                profile.getFullName(),
                age,
                profile.getCurrentLocation(),
                profile.getProfilePictureUrl(),
                profile.getBio(),
                profile.getSocialBattery().name(),
                profile.getPlanningStyle().name(),
                profile.getBudget().name(),
                safeList(profile.getActivities()),
                safeList(profile.getLanguages()),
                safeList(profile.getLookingForWhat()),
                compatibilityScore
        );
    }

    private static List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }
}