package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.application.dto.SendTripChatMessageInputDto;
import com.tbf.project.backend.application.dto.TripChatMessageResponseDto;
import com.tbf.project.backend.application.usecases.SendTripChatMessageUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class TripChatWebSocketController {

    private final SendTripChatMessageUseCase sendTripChatMessageUseCase;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/trips/{tripId}/chat/send")
    public void sendMessage(
            @DestinationVariable Long tripId,
            @Valid @Payload SendTripChatMessageInputDto input,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long currentUserId = extractUserId(headerAccessor);

        TripChatMessageResponseDto savedMessage =
                sendTripChatMessageUseCase.execute(
                        currentUserId,
                        tripId,
                        input
                );

        messagingTemplate.convertAndSend(
                "/topic/trips/" + tripId + "/chat",
                savedMessage
        );
    }

    private Long extractUserId(SimpMessageHeaderAccessor headerAccessor) {
        Object userId = headerAccessor.getSessionAttributes().get("userId");

        if (userId == null) {
            throw new SecurityException("Unauthenticated WebSocket session.");
        }

        return (Long) userId;
    }
}