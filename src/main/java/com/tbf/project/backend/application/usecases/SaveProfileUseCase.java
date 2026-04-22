package com.tbf.project.backend.application.usecases;

public interface SaveProfileUseCase {
    void execute(Long actorUserId, Long targetUserId);
}