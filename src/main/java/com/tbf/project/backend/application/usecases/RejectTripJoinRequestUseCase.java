package com.tbf.project.backend.application.usecases;

public interface RejectTripJoinRequestUseCase {
    void execute(Long currentUserId, Long tripId, Long requestId);
}