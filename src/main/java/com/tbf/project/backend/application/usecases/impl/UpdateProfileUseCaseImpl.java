package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.MyProfileResponseDto;
import com.tbf.project.backend.application.mapper.ProfileMapper;
import com.tbf.project.backend.application.usecases.UpdateProfileUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;

public class UpdateProfileUseCaseImpl implements UpdateProfileUseCase {

    private final ProfileGateway profileGateway;

    public UpdateProfileUseCaseImpl(ProfileGateway profileGateway) {
        this.profileGateway = profileGateway;
    }

    @Override
    public MyProfileResponseDto execute(Long userId, CreateProfileInputDto input) {
        UserProfile existingProfile = profileGateway.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));

        UserProfile updatedProfile = ProfileMapper.toUpdatedDomain(
                input,
                userId,
                existingProfile.getVerificationStatus()
        );

        UserProfile savedProfile = profileGateway.save(updatedProfile);
        return ProfileMapper.toMyProfileDto(savedProfile);
    }
}