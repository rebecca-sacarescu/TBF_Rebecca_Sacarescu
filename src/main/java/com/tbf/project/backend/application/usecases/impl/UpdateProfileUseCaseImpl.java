package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.MyProfileResponseDto;
import com.tbf.project.backend.application.mapper.ProfileMapper;
import com.tbf.project.backend.application.usecases.UpdateProfileUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;

public class UpdateProfileUseCaseImpl implements UpdateProfileUseCase {

    private final ProfileGateway profileGateway;
    private final FeedCacheGateway feedCacheGateway;

    public UpdateProfileUseCaseImpl(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway
    ) {
        this.profileGateway = profileGateway;
        this.feedCacheGateway = feedCacheGateway;
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

        feedCacheGateway.evictFeed(userId);

        return ProfileMapper.toMyProfileDto(savedProfile);
    }
}