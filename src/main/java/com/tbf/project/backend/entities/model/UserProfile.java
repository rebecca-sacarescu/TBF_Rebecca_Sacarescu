package com.tbf.project.backend.entities.model;

import com.tbf.project.backend.entities.model.enums.Budget;
import com.tbf.project.backend.entities.model.enums.PlanningStyle;
import com.tbf.project.backend.entities.model.enums.SocialBattery;
import com.tbf.project.backend.entities.model.enums.VerificationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
public class UserProfile {
    private Long id;
    private Long userId;

    private String fullName;
    private LocalDate birthDate;
    private String gender;
    private String originCountry;
    private String originCity;
    private String currentLocation;

    private String profilePictureUrl;
    private String bio;

    private VerificationStatus verificationStatus;

    private SocialBattery socialBattery;
    private PlanningStyle planningStyle;
    private Budget budget;

    private List<String> activities;
    private List<String> destinationTypes;
    private List<String> experienceTypes;
    private List<String> languages;
    private List<String> lookingForWho;
    private List<String> lookingForWhat;
}