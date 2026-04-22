package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.DiscoverProfileResponseDto;

public interface GetDiscoverProfileUseCase {
    DiscoverProfileResponseDto execute(Long actorUserId, Long targetUserId);
}