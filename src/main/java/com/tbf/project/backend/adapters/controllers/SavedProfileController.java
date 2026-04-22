package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.adapters.security.CustomUserDetails;
import com.tbf.project.backend.application.dto.SavedProfileResponseDto;
import com.tbf.project.backend.application.usecases.GetSavedProfilesUseCase;
import com.tbf.project.backend.application.usecases.RemoveSavedProfileUseCase;
import com.tbf.project.backend.application.usecases.SaveProfileUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/saved-profiles")
@RequiredArgsConstructor
public class SavedProfileController {

    private final GetSavedProfilesUseCase getSavedProfilesUseCase;
    private final SaveProfileUseCase saveProfileUseCase;
    private final RemoveSavedProfileUseCase removeSavedProfileUseCase;

    @GetMapping
    public ResponseEntity<List<SavedProfileResponseDto>> getSavedProfiles(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long actorUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(getSavedProfilesUseCase.execute(actorUserId));
    }

    @PostMapping("/{targetUserId}")
    public ResponseEntity<Void> saveProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long targetUserId
    ) {
        Long actorUserId = userDetails.getUser().getId();
        saveProfileUseCase.execute(actorUserId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<Void> removeSavedProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long targetUserId
    ) {
        Long actorUserId = userDetails.getUser().getId();
        removeSavedProfileUseCase.execute(actorUserId, targetUserId);
        return ResponseEntity.noContent().build();
    }
}