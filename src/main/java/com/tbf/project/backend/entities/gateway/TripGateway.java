package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.enums.TripStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TripGateway {

    Trip save(Trip trip);

    Optional<Trip> findById(Long tripId);

    List<Trip> findAllByOwnerUserId(Long ownerUserId);

    List<Trip> findAllByStatusAndStartDateGreaterThanEqualAndOwnerUserIdNot(
            TripStatus status,
            LocalDate startDate,
            Long ownerUserId
    );

    List<Trip> findAllByIds(List<Long> tripIds);
}