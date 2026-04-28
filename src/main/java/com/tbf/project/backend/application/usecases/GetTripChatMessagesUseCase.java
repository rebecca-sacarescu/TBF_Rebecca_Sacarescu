package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.TripChatMessageResponseDto;

import java.util.List;

public interface GetTripChatMessagesUseCase {

    List<TripChatMessageResponseDto> execute(
            Long currentUserId,
            Long tripId,
            int page,
            int size
    );
}