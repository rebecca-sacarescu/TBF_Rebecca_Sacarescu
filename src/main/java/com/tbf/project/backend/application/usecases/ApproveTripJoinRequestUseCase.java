package com.tbf.project.backend.application.usecases;

public interface ApproveTripJoinRequestUseCase {
    void execute(Long currentUserId, Long tripId, Long requestId);
}