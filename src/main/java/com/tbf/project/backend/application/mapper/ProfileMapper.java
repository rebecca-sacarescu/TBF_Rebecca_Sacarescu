package com.tbf.project.backend.application.mapper;

import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.MyProfileResponseDto;
import com.tbf.project.backend.application.dto.ProfileResponseDto;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.Budget;
import com.tbf.project.backend.entities.model.enums.PlanningStyle;
import com.tbf.project.backend.entities.model.enums.SocialBattery;
import com.tbf.project.backend.entities.model.enums.VerificationStatus;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashSet;

public class ProfileMapper {

    private ProfileMapper() {
    }

    public static UserProfile toDomain(CreateProfileInputDto dto, Long userId) {
        return UserProfile.builder()
                .userId(userId)
                .fullName(dto.fullName())
                .birthDate(dto.birthDate())
                .gender(dto.gender())
                .originCountry(dto.originCountry())
                .originCity(dto.originCity())
                .currentLocation(dto.currentLocation())
                .profilePictureUrl(dto.profilePictureUrl())
                .bio(dto.bio())
                .verificationStatus(VerificationStatus.UNVERIFIED)
                .socialBattery(SocialBattery.valueOf(dto.socialBattery()))
                .planningStyle(PlanningStyle.valueOf(dto.planningStyle()))
                .budget(Budget.valueOf(dto.budget()))
                .activities(safeList(dto.activities()))
                .destinationTypes(safeList(dto.destinationTypes()))
                .experienceTypes(safeList(dto.experienceTypes()))
                .languages(safeList(dto.languages()))
                .lookingForWho(safeList(dto.lookingForWho()))
                .lookingForWhat(safeList(dto.lookingForWhat()))
                .build();
    }

    public static UserProfile toUpdatedDomain(CreateProfileInputDto dto, Long userId, VerificationStatus verificationStatus) {
        return UserProfile.builder()
                .userId(userId)
                .fullName(dto.fullName())
                .birthDate(dto.birthDate())
                .gender(dto.gender())
                .originCountry(dto.originCountry())
                .originCity(dto.originCity())
                .currentLocation(dto.currentLocation())
                .profilePictureUrl(dto.profilePictureUrl())
                .bio(dto.bio())
                .verificationStatus(verificationStatus)
                .socialBattery(SocialBattery.valueOf(dto.socialBattery()))
                .planningStyle(PlanningStyle.valueOf(dto.planningStyle()))
                .budget(Budget.valueOf(dto.budget()))
                .activities(safeList(dto.activities()))
                .destinationTypes(safeList(dto.destinationTypes()))
                .experienceTypes(safeList(dto.experienceTypes()))
                .languages(safeList(dto.languages()))
                .lookingForWho(safeList(dto.lookingForWho()))
                .lookingForWhat(safeList(dto.lookingForWhat()))
                .build();
    }

    public static MyProfileResponseDto toMyProfileDto(UserProfile domain) {
        int age = Period.between(domain.getBirthDate(), LocalDate.now()).getYears();

        return new MyProfileResponseDto(
                domain.getFullName(),
                domain.getBirthDate(),
                age,
                domain.getGender(),
                domain.getOriginCountry(),
                domain.getOriginCity(),
                domain.getCurrentLocation(),
                domain.getBio(),
                domain.getProfilePictureUrl(),
                domain.getVerificationStatus().name(),
                domain.getSocialBattery().name(),
                domain.getPlanningStyle().name(),
                domain.getBudget().name(),
                safeList(domain.getActivities()),
                safeList(domain.getDestinationTypes()),
                safeList(domain.getExperienceTypes()),
                safeList(domain.getLanguages()),
                safeList(domain.getLookingForWho()),
                safeList(domain.getLookingForWhat())
        );
    }

    public static ProfileResponseDto toDto(UserProfile domain) {
        int age = Period.between(domain.getBirthDate(), LocalDate.now()).getYears();

        return new ProfileResponseDto(
                domain.getFullName(),
                age,
                domain.getGender(),
                domain.getCurrentLocation(),
                domain.getBio(),
                domain.getProfilePictureUrl(),
                domain.getVerificationStatus().name(),
                domain.getSocialBattery().name(),
                domain.getPlanningStyle().name(),
                domain.getBudget().name(),
                safeList(domain.getActivities()),
                safeList(domain.getDestinationTypes()),
                safeList(domain.getExperienceTypes()),
                safeList(domain.getLanguages()),
                safeList(domain.getLookingForWho()),
                safeList(domain.getLookingForWhat())
        );
    }

    private static List<String> safeList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return new ArrayList<>(new LinkedHashSet<>(values));
    }
}