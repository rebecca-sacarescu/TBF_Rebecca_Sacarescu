package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.RecordFeedInteractionInputDto;

public interface RecordFeedInteractionUseCase {
    void execute(Long actorUserId, RecordFeedInteractionInputDto input);
}