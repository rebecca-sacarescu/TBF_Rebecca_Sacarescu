package com.tbf.project.backend.application.dto;

import java.time.LocalDate;

public record TripCountdownDto(
        LocalDate startDate,
        long daysUntilStart,
        boolean startsToday,
        boolean alreadyStarted,
        String label
) {
}