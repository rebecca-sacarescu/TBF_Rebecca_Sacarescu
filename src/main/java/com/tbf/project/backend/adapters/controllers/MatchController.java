package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.MatchResponseDto;
import com.tbf.project.backend.application.usecases.DeleteMatchUseCase;
import com.tbf.project.backend.application.usecases.GetMyMatchesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
public class MatchController {

    private final GetMyMatchesUseCase getMyMatchesUseCase;
    private final DeleteMatchUseCase deleteMatchUseCase;

    @GetMapping
    public ResponseEntity<List<MatchResponseDto>> getMyMatches(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getMyMatchesUseCase.execute(currentUserId));
    }

    @DeleteMapping("/{matchId}")
    public ResponseEntity<Void> deleteMatch(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long matchId
    ) {
        Long currentUserId = userDetails.getUser().getId();
        deleteMatchUseCase.execute(currentUserId, matchId);
        return ResponseEntity.noContent().build();
    }
}