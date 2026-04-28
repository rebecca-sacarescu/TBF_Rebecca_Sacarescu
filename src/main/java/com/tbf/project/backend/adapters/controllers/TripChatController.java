package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.TripChatMessageResponseDto;
import com.tbf.project.backend.application.usecases.GetTripChatMessagesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trips/{tripId}/chat")
@RequiredArgsConstructor
public class TripChatController {

    private final GetTripChatMessagesUseCase getTripChatMessagesUseCase;

    @GetMapping("/messages")
    public ResponseEntity<List<TripChatMessageResponseDto>> getMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long tripId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        Long currentUserId = userDetails.getUser().getId();

        return ResponseEntity.ok(
                getTripChatMessagesUseCase.execute(
                        currentUserId,
                        tripId,
                        page,
                        size
                )
        );
    }
}