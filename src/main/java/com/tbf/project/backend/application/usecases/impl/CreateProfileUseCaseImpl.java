package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.MyProfileResponseDto;
import com.tbf.project.backend.application.mapper.ProfileMapper;
import com.tbf.project.backend.application.usecases.CreateProfileUseCase;
import com.tbf.project.backend.entities.gateway.FeedCacheGateway;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;

public class CreateProfileUseCaseImpl implements CreateProfileUseCase {

    private final ProfileGateway profileGateway;
    private final FeedCacheGateway feedCacheGateway;

    public CreateProfileUseCaseImpl(
            ProfileGateway profileGateway,
            FeedCacheGateway feedCacheGateway
    ) {
        this.profileGateway = profileGateway;
        this.feedCacheGateway = feedCacheGateway;
    }

    @Override
    public MyProfileResponseDto execute(Long userId, CreateProfileInputDto input) {
        if (profileGateway.existsByUserId(userId)) {
            throw new IllegalArgumentException("Profile already exists for user ID: " + userId);
        }

        UserProfile userProfile = ProfileMapper.toDomain(input, userId);
        UserProfile savedProfile = profileGateway.save(userProfile);

        feedCacheGateway.evictFeed(userId);

        return ProfileMapper.toMyProfileDto(savedProfile);
    }
}