package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.ProfileResponseDto;
import com.tbf.project.backend.application.mapper.ProfileMapper;
import com.tbf.project.backend.application.usecases.GetFeedUseCase;
import com.tbf.project.backend.entities.gateway.ProfileGateway;

import java.util.List;
import java.util.stream.Collectors;

public class GetFeedUseCaseImpl implements GetFeedUseCase {

    private final ProfileGateway profileGateway;

    public GetFeedUseCaseImpl(ProfileGateway profileGateway) {
        this.profileGateway = profileGateway;
    }

    @Override
    public List<ProfileResponseDto> execute(Long currentUserId) {
        return profileGateway.findAllExceptUserId(currentUserId).stream()
                .map(ProfileMapper::toDto)
                .collect(Collectors.toList());
    }
}