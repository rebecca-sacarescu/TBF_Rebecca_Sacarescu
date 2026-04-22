package com.tbf.project.backend.application.mapper;

import com.tbf.project.backend.application.dto.SavedProfileResponseDto;
import com.tbf.project.backend.entities.model.SavedProfile;
import com.tbf.project.backend.entities.model.UserProfile;

import java.time.LocalDate;
import java.time.Period;

public class SavedProfileMapper {

    private SavedProfileMapper() {
    }

    public static SavedProfileResponseDto toDto(
            SavedProfile savedProfile,
            UserProfile targetProfile,
            int compatibilityScore
    ) {
        int age = Period.between(targetProfile.getBirthDate(), LocalDate.now()).getYears();

        return new SavedProfileResponseDto(
                targetProfile.getUserId(),
                targetProfile.getFullName(),
                age,
                targetProfile.getCurrentLocation(),
                targetProfile.getOriginCountry(),
                targetProfile.getProfilePictureUrl(),
                targetProfile.getBio(),
                targetProfile.getSocialBattery().name(),
                targetProfile.getPlanningStyle().name(),
                targetProfile.getBudget().name(),
                compatibilityScore,
                savedProfile.getCreatedAt()
        );
    }
}