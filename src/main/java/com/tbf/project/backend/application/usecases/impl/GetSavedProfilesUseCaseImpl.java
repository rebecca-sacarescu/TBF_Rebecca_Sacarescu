package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.ReciprocalCompatibilityResult;
import com.tbf.project.backend.application.dto.SavedProfileResponseDto;
import com.tbf.project.backend.application.mapper.SavedProfileMapper;
import com.tbf.project.backend.application.service.ReciprocalCompatibilityCalculator;
import com.tbf.project.backend.application.usecases.GetSavedProfilesUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.gateway.SavedProfileGateway;
import com.tbf.project.backend.entities.model.SavedProfile;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class GetSavedProfilesUseCaseImpl implements GetSavedProfilesUseCase {

    private final ProfileGateway profileGateway;
    private final SavedProfileGateway savedProfileGateway;
    private final ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator;

    public GetSavedProfilesUseCaseImpl(
            ProfileGateway profileGateway,
            SavedProfileGateway savedProfileGateway,
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator
    ) {
        this.profileGateway = profileGateway;
        this.savedProfileGateway = savedProfileGateway;
        this.reciprocalCompatibilityCalculator = reciprocalCompatibilityCalculator;
    }

    @Override
    public List<SavedProfileResponseDto> execute(Long actorUserId) {
        UserProfile actorProfile = profileGateway.findById(actorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Actor profile not found for user ID: " + actorUserId));

        List<SavedProfile> savedProfiles = savedProfileGateway.findAllByActorUserId(actorUserId);

        List<Long> targetUserIds = savedProfiles.stream()
                .map(SavedProfile::getTargetUserId)
                .toList();

        Map<Long, UserProfile> profilesByUserId = profileGateway.findAllByUserIds(targetUserIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, Function.identity()));

        return savedProfiles.stream()
                .map(saved -> {
                    UserProfile targetProfile = profilesByUserId.get(saved.getTargetUserId());
                    if (targetProfile == null) {
                        return null;
                    }

                    ReciprocalCompatibilityResult compatibilityResult =
                            reciprocalCompatibilityCalculator.calculate(actorProfile, targetProfile);

                    return SavedProfileMapper.toDto(
                            saved,
                            targetProfile,
                            compatibilityResult.reciprocalScore100()
                    );
                })
                .filter(dto -> dto != null)
                .sorted((a, b) -> b.savedAt().compareTo(a.savedAt()))
                .toList();
    }
}