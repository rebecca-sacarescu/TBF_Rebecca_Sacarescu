package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.adapters.websocket.TripPlanBroadcastService;
import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;
import com.tbf.project.backend.application.dto.GenerateTripPlanInputDto;
import com.tbf.project.backend.application.usecases.GenerateTripPlanUseCase;
import com.tbf.project.backend.application.usecases.GetTripPlanUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripAiPlanController {

    private final GenerateTripPlanUseCase generateTripPlanUseCase;
    private final GetTripPlanUseCase getTripPlanUseCase;
    private final TripPlanBroadcastService tripPlanBroadcastService;

    /**
     * POST /trips/{tripId}/ai-plan
     * Any ACTIVE member can generate or regenerate the AI plan for the trip.
     * Saves/updates in DB and broadcasts to all members via WebSocket.
     */
    @PostMapping("/{tripId}/ai-plan")
    public ResponseEntity<AiTripPlanResponseDto> generatePlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long tripId,
            @Valid @RequestBody(required = false) GenerateTripPlanInputDto input
    ) {
        Long currentUserId = userDetails.getUser().getId();

        // Use empty input if body not provided
        GenerateTripPlanInputDto safeInput = input != null ? input : new GenerateTripPlanInputDto(null);

        AiTripPlanResponseDto plan = generateTripPlanUseCase.execute(currentUserId, tripId, safeInput);

        // Option D — broadcast to all members in Trip Room
        tripPlanBroadcastService.broadcastPlanGenerated(tripId, plan, plan.generatedByName());

        return ResponseEntity.ok(plan);
    }

    /**
     * GET /trips/{tripId}/ai-plan
     * Any ACTIVE member can view the last saved AI plan.
     * Returns 404-equivalent if no plan has been generated yet.
     */
    @GetMapping("/{tripId}/ai-plan")
    public ResponseEntity<AiTripPlanResponseDto> getPlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long tripId
    ) {
        Long currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getTripPlanUseCase.execute(currentUserId, tripId));
    }
}