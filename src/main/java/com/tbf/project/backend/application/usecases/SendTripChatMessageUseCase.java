package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.SendTripChatMessageInputDto;
import com.tbf.project.backend.application.dto.TripChatMessageResponseDto;

public interface SendTripChatMessageUseCase {

    TripChatMessageResponseDto execute(
            Long currentUserId,
            Long tripId,
            SendTripChatMessageInputDto input
    );
}