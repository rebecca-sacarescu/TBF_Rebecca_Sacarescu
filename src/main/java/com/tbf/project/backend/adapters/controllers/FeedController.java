package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.FeedItemResponseDto;
import com.tbf.project.backend.application.dto.RecordFeedInteractionInputDto;
import com.tbf.project.backend.application.usecases.GetFeedUseCase;
import com.tbf.project.backend.application.usecases.RecordFeedInteractionUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
public class FeedController {

    private final GetFeedUseCase getFeedUseCase;
    private final RecordFeedInteractionUseCase recordFeedInteractionUseCase;

    @GetMapping
    public ResponseEntity<List<FeedItemResponseDto>> getFeed(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long currentUserId = userDetails.getUser().getId();
        List<FeedItemResponseDto> feed = getFeedUseCase.execute(currentUserId, page, size);

        return ResponseEntity.ok(feed);
    }

    @PostMapping("/interactions")
    public ResponseEntity<Void> recordInteraction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RecordFeedInteractionInputDto input
    ) {
        Long currentUserId = userDetails.getUser().getId();
        recordFeedInteractionUseCase.execute(currentUserId, input);
        return ResponseEntity.noContent().build();
    }
}