package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.ProfileResponseDto;
import com.tbf.project.backend.application.mapper.ProfileMapper;
import com.tbf.project.backend.application.usecases.CreateProfileUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;

public class CreateProfileUseCaseImpl implements CreateProfileUseCase {

    private final ProfileGateway profileGateway;

    public CreateProfileUseCaseImpl(ProfileGateway profileGateway) {
        this.profileGateway = profileGateway;
    }

    @Override
    public ProfileResponseDto execute(Long userId, CreateProfileInputDto input) {
        if (profileGateway.existsByUserId(userId)) {
            throw new IllegalArgumentException("Profile already exists for user ID: " + userId);
        }

        UserProfile userProfile = ProfileMapper.toDomain(input, userId);

        UserProfile savedProfile = profileGateway.save(userProfile);

        return ProfileMapper.toDto(savedProfile);
    }
}