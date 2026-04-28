package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.CreateTripInputDto;
import com.tbf.project.backend.application.dto.TripCardResponseDto;
import com.tbf.project.backend.application.dto.TripJoinRequestInputDto;
import com.tbf.project.backend.application.dto.TripJoinRequestResponseDto;
import com.tbf.project.backend.application.usecases.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.tbf.project.backend.application.dto.TripCrewInsightsResponseDto;
import com.tbf.project.backend.application.usecases.GetTripCrewInsightsUseCase;
import java.util.List;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripController {

    private final CreateTripUseCase createTripUseCase;
    private final GetJoinableTripsUseCase getJoinableTripsUseCase;
    private final RequestToJoinTripUseCase requestToJoinTripUseCase;
    private final GetMyCreatedTripsUseCase getMyCreatedTripsUseCase;
    private final GetMyJoinedTripsUseCase getMyJoinedTripsUseCase;
    private final GetTripJoinRequestsUseCase getTripJoinRequestsUseCase;
    private final ApproveTripJoinRequestUseCase approveTripJoinRequestUseCase;
    private final RejectTripJoinRequestUseCase rejectTripJoinRequestUseCase;
    private final GetTripCrewInsightsUseCase getTripCrewInsightsUseCase;

    @PostMapping
    public ResponseEntity<TripCardResponseDto> createTrip(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateTripInputDto input
    ) {
        Long currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(createTripUseCase.execute(currentUserId, input));
    }

    @GetMapping("/joinable")
    public ResponseEntity<List<TripCardResponseDto>> getJoinableTrips(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getJoinableTripsUseCase.execute(currentUserId));
    }

    @GetMapping("/mine/created")
    public ResponseEntity<List<TripCardResponseDto>> getMyCreatedTrips(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getMyCreatedTripsUseCase.execute(currentUserId));
    }

    @GetMapping("/mine/joined")
    public ResponseEntity<List<TripCardResponseDto>> getMyJoinedTrips(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getMyJoinedTripsUseCase.execute(currentUserId));
    }

    @PostMapping("/{tripId}/join-requests")
    public ResponseEntity<Void> requestToJoinTrip(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long tripId,
            @Valid @RequestBody TripJoinRequestInputDto input
    ) {
        Long currentUserId = userDetails.getUser().getId();
        requestToJoinTripUseCase.execute(currentUserId, tripId, input);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tripId}/join-requests")
    public ResponseEntity<List<TripJoinRequestResponseDto>> getTripJoinRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long tripId
    ) {
        Long currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getTripJoinRequestsUseCase.execute(currentUserId, tripId));
    }

    @PostMapping("/{tripId}/join-requests/{requestId}/approve")
    public ResponseEntity<Void> approveJoinRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long tripId,
            @PathVariable Long requestId
    ) {
        Long currentUserId = userDetails.getUser().getId();
        approveTripJoinRequestUseCase.execute(currentUserId, tripId, requestId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/join-requests/{requestId}/reject")
    public ResponseEntity<Void> rejectJoinRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long tripId,
            @PathVariable Long requestId
    ) {
        Long currentUserId = userDetails.getUser().getId();
        rejectTripJoinRequestUseCase.execute(currentUserId, tripId, requestId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tripId}/crew-insights")
    public ResponseEntity<TripCrewInsightsResponseDto> getCrewInsights(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long tripId
    ) {
        Long currentUserId = currentUser.getUser().getId();

        return ResponseEntity.ok(
                getTripCrewInsightsUseCase.execute(currentUserId, tripId)
        );
    }
}