package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.DiscoverProfileResponseDto;
import com.tbf.project.backend.application.dto.RecordProfileInteractionEventInputDto;
import com.tbf.project.backend.application.usecases.GetDiscoverProfileUseCase;
import com.tbf.project.backend.application.usecases.RecordProfileInteractionEventUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/discover")
@RequiredArgsConstructor
public class DiscoverController {

    private final GetDiscoverProfileUseCase getDiscoverProfileUseCase;
    private final RecordProfileInteractionEventUseCase recordProfileInteractionEventUseCase;

    @GetMapping("/{targetUserId}")
    public ResponseEntity<DiscoverProfileResponseDto> getDiscoverProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long targetUserId
    ) {
        Long actorUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getDiscoverProfileUseCase.execute(actorUserId, targetUserId));
    }

    @PostMapping("/{targetUserId}/events")
    public ResponseEntity<Void> recordDiscoverEvent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long targetUserId,
            @Valid @RequestBody RecordProfileInteractionEventInputDto input
    ) {
        Long actorUserId = userDetails.getUser().getId();
        recordProfileInteractionEventUseCase.execute(actorUserId, targetUserId, input);
        return ResponseEntity.noContent().build();
    }
}