package com.tbf.project.backend.application.service;

import com.tbf.project.backend.application.dto.TripCountdownDto;
import com.tbf.project.backend.entities.model.Trip;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class TripCountdownService {

    public TripCountdownDto build(Trip trip, LocalDate today) {
        long daysUntilStart = ChronoUnit.DAYS.between(today, trip.getStartDate());

        boolean startsToday = trip.getStartDate().equals(today);
        boolean alreadyStarted = trip.getStartDate().isBefore(today);

        String label;

        if (startsToday) {
            label = "Starts today";
        } else if (trip.getStartDate().equals(today.plusDays(1))) {
            label = "Starts tomorrow";
        } else if (alreadyStarted) {
            label = "Already started";
        } else {
            label = "Starts in " + daysUntilStart + " days";
        }

        return new TripCountdownDto(
                trip.getStartDate(),
                daysUntilStart,
                startsToday,
                alreadyStarted,
                label
        );
    }
}