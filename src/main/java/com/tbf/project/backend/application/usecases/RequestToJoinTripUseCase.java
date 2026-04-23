package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.TripJoinRequestInputDto;

public interface RequestToJoinTripUseCase {
    void execute(Long currentUserId, Long tripId, TripJoinRequestInputDto input);
}