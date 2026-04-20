package com.tbf.project.backend.application.mapper;

import com.tbf.project.backend.application.dto.MatchResponseDto;
import com.tbf.project.backend.entities.model.Match;
import com.tbf.project.backend.entities.model.UserProfile;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

public class MatchMapper {

    private MatchMapper() {
    }

    public static MatchResponseDto toDto(
            Match match,
            UserProfile otherProfile,
            int compatibilityScore,
            boolean superLikeInvolved,
            List<String> contextBadges,
            String whyYouMatched
    ) {
        int age = Period.between(otherProfile.getBirthDate(), LocalDate.now()).getYears();

        return new MatchResponseDto(
                match.getId(),
                otherProfile.getUserId(),
                otherProfile.getFullName(),
                age,
                otherProfile.getCurrentLocation(),
                otherProfile.getOriginCountry(),
                otherProfile.getProfilePictureUrl(),
                otherProfile.getBio(),
                otherProfile.getSocialBattery().name(),
                otherProfile.getPlanningStyle().name(),
                otherProfile.getBudget().name(),
                compatibilityScore,
                superLikeInvolved,
                match.getCreatedAt(),
                contextBadges,
                whyYouMatched
        );
    }
}