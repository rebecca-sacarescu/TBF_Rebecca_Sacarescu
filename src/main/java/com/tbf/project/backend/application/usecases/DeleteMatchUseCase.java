package com.tbf.project.backend.application.usecases;

public interface DeleteMatchUseCase {
    void execute(Long currentUserId, Long matchId);
}