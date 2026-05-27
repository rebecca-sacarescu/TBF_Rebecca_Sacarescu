package com.tbf.project.backend.adapters.websocket;

import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TripPlanBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastPlanGenerated(Long tripId, AiTripPlanResponseDto plan, String generatedByName) {
        TripPlanNotificationDto notification = new TripPlanNotificationDto(
                tripId,
                generatedByName + " generated a new AI Trip Plan for " + plan.title() + " 🤖✈️",
                plan
        );
        messagingTemplate.convertAndSend("/topic/trips/" + tripId + "/ai-plan", notification);
    }

    public record TripPlanNotificationDto(
            Long tripId,
            String message,
            AiTripPlanResponseDto plan
    ) {}
}