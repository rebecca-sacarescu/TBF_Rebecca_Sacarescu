package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.usecases.ExpireTripsUseCase;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.enums.TripStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ExpireTripsUseCaseImpl implements ExpireTripsUseCase {

    private final TripGateway tripGateway;

    public ExpireTripsUseCaseImpl(TripGateway tripGateway) {
        this.tripGateway = tripGateway;
    }

    @Override
    public void execute() {
        List<Trip> tripsToExpire = tripGateway.findTripsToExpire(LocalDate.now());

        for (Trip trip : tripsToExpire) {
            trip.setStatus(TripStatus.EXPIRED);
            trip.setUpdatedAt(LocalDateTime.now());
            tripGateway.save(trip);
        }
    }
}