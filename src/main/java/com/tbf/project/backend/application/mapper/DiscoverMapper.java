package com.tbf.project.backend.application.mapper;

import com.tbf.project.backend.application.dto.DiscoverProfileResponseDto;
import com.tbf.project.backend.application.dto.ReciprocalCompatibilityResult;
import com.tbf.project.backend.entities.model.UserProfile;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

public class DiscoverMapper {

    private DiscoverMapper() {
    }

    public static DiscoverProfileResponseDto toDto(
            UserProfile profile,
            ReciprocalCompatibilityResult compatibilityResult,
            boolean saved
    ) {
        int age = Period.between(profile.getBirthDate(), LocalDate.now()).getYears();

        return new DiscoverProfileResponseDto(
                profile.getUserId(),
                profile.getFullName(),
                age,
                profile.getGender(),
                profile.getOriginCountry(),
                profile.getOriginCity(),
                profile.getCurrentLocation(),
                profile.getBio(),
                profile.getProfilePictureUrl(),
                profile.getVerificationStatus().name(),
                profile.getSocialBattery().name(),
                profile.getPlanningStyle().name(),
                profile.getBudget().name(),
                safeList(profile.getActivities()),
                safeList(profile.getDestinationTypes()),
                safeList(profile.getExperienceTypes()),
                safeList(profile.getLanguages()),
                safeList(profile.getLookingForWho()),
                safeList(profile.getLookingForWhat()),
                compatibilityResult.reciprocalScore100(),
                compatibilityResult.highlights(),
                saved
        );
    }

    private static List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }
}