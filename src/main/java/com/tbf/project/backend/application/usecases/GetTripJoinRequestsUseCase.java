package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.TripJoinRequestResponseDto;

import java.util.List;

public interface GetTripJoinRequestsUseCase {
    List<TripJoinRequestResponseDto> execute(Long currentUserId, Long tripId);
}