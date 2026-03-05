package com.tbf.project.backend.application.mapper;
import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.ProfileResponseDto;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.Budget;
import com.tbf.project.backend.entities.model.enums.PlanningStyle;
import com.tbf.project.backend.entities.model.enums.SocialBattery;
import com.tbf.project.backend.entities.model.enums.VerificationStatus;

import java.time.LocalDate;
import java.time.Period;
public class ProfileMapper {

    //Dto -> Domain
    public static UserProfile toDomain(CreateProfileInputDto dto, Long userId){
        return UserProfile.builder()
                .userId(userId)
                .fullName(dto.fullName())
                .birthDate(dto.birthDate())
                .gender(dto.gender())
                .originCountry(dto.originCountry())
                .originCity(dto.originCity())
                .currentLocation(dto.currentLocation())
                .bio(dto.bio())
                .verificationStatus(VerificationStatus.UNVERIFIED)
                .socialBattery(SocialBattery.valueOf(dto.socialBattery()))
                .planningStyle(PlanningStyle.valueOf(dto.planningStyle()))
                .budget(Budget.valueOf(dto.budget()))
                .activities(dto.activities())
                .destinationTypes(dto.destinationTypes())
                .experienceTypes(dto.experienceTypes())
                .languages(dto.languages())
                .lookingForWho(dto.lookingForWho())
                .lookingForWhat(dto.lookingForWhat())
                .build();
    }

    //Domain -> Dto
    public static ProfileResponseDto toDto(UserProfile domain){
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
                domain.getActivities(),
                domain.getDestinationTypes(),
                domain.getExperienceTypes(),
                domain.getLanguages(),
                domain.getLookingForWho(),
                domain.getLookingForWhat()
        );
    }
}
