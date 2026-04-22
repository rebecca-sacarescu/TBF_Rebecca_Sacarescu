package com.tbf.project.backend.application.usecases;

public interface RemoveSavedProfileUseCase {
    void execute(Long actorUserId, Long targetUserId);
}