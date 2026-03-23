package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.MyProfileResponseDto;
import com.tbf.project.backend.application.usecases.CreateProfileUseCase;
import com.tbf.project.backend.application.usecases.GetProfileUseCase;
import com.tbf.project.backend.application.usecases.UpdateProfileUseCase;
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
    private final UpdateProfileUseCase updateProfileUseCase;

    @PostMapping
    public ResponseEntity<MyProfileResponseDto> createProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateProfileInputDto input) {

        Long userId = userDetails.getUser().getId();
        MyProfileResponseDto response = createProfileUseCase.execute(userId, input);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<MyProfileResponseDto> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();
        MyProfileResponseDto response = getProfileUseCase.execute(userId);

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<MyProfileResponseDto> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateProfileInputDto input) {

        Long userId = userDetails.getUser().getId();
        MyProfileResponseDto response = updateProfileUseCase.execute(userId, input);

        return ResponseEntity.ok(response);
    }
}