package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.RecordProfileInteractionEventInputDto;

public interface RecordProfileInteractionEventUseCase {
    void execute(Long actorUserId, Long targetUserId, RecordProfileInteractionEventInputDto input);
}