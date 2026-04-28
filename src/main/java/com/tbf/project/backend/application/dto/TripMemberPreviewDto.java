package com.tbf.project.backend.application.dto;

public record TripMemberPreviewDto(
        Long userId,
        String fullName,
        String profilePictureUrl,
        String role
) {
}