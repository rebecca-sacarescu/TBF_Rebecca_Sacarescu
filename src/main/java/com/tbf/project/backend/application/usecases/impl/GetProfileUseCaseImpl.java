package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.MyProfileResponseDto;
import com.tbf.project.backend.application.mapper.ProfileMapper;
import com.tbf.project.backend.application.usecases.GetProfileUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;

public class GetProfileUseCaseImpl implements GetProfileUseCase {

    private final ProfileGateway profileGateway;

    public GetProfileUseCaseImpl(ProfileGateway profileGateway) {
        this.profileGateway = profileGateway;
    }

    @Override
    public MyProfileResponseDto execute(Long userId) {
        UserProfile userProfile = profileGateway.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));

        return ProfileMapper.toMyProfileDto(userProfile);
    }
}