package com.tbf.project.backend.application.dto;

import java.time.LocalDate;
import java.util.List;

public record TripCardResponseDto(
        Long tripId,
        Long ownerUserId,
        String ownerFullName,
        String ownerProfilePictureUrl,
        String title,
        String destinationCity,
        String destinationCountry,
        LocalDate startDate,
        LocalDate endDate,
        String budget,
        String tripType,
        String description,
        Integer targetGroupSize,
        Integer currentMemberCount,
        Integer spotsLeft,
        String status,
        List<TripMemberPreviewDto> memberPreview,
        TripCountdownDto countdown
) {
}