package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.ProfileResponseDto;
import com.tbf.project.backend.application.usecases.GetFeedUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
public class FeedController {

    private final GetFeedUseCase getFeedUseCase;

    @GetMapping
    public ResponseEntity<List<ProfileResponseDto>> getFeed(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long currentUserId = userDetails.getUser().getId();
        List<ProfileResponseDto> feed = getFeedUseCase.execute(currentUserId);

        return ResponseEntity.ok(feed);
    }
}