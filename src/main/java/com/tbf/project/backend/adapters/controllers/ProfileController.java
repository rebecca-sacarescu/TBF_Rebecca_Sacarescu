package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.ProfileResponseDto;
import com.tbf.project.backend.application.usecases.CreateProfileUseCase;
import com.tbf.project.backend.application.usecases.GetProfileUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final CreateProfileUseCase createProfileUseCase;
    private final GetProfileUseCase getProfileUseCase;

    @PostMapping
    public ResponseEntity<ProfileResponseDto> createProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateProfileInputDto input) {

        Long userId = userDetails.getUser().getId();

        ProfileResponseDto response = createProfileUseCase.execute(userId, input);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ProfileResponseDto> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();
        ProfileResponseDto response = getProfileUseCase.execute(userId);
        return ResponseEntity.ok(response);
    }
}