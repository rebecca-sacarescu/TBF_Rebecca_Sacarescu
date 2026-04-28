package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.TripJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.TripJpaRepository;
import com.tbf.project.backend.entities.gateway.TripGateway;
import com.tbf.project.backend.entities.model.Trip;
import com.tbf.project.backend.entities.model.enums.TripStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TripGatewayImpl implements TripGateway {

    private final TripJpaRepository repository;

    @Override
    public Trip save(Trip trip) {
        TripJpaEntity entity = TripJpaEntity.builder()
                .id(trip.getId())
                .ownerUserId(trip.getOwnerUserId())
                .title(trip.getTitle())
                .destinationCity(trip.getDestinationCity())
                .destinationCountry(trip.getDestinationCountry())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .budget(trip.getBudget())
                .tripType(trip.getTripType())
                .description(trip.getDescription())
                .targetGroupSize(trip.getTargetGroupSize())
                .status(trip.getStatus())
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();

        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<Trip> findById(Long tripId) {
        return repository.findById(tripId).map(this::toDomain);
    }

    @Override
    public List<Trip> findAllByOwnerUserId(Long ownerUserId) {
        return repository.findAllByOwnerUserId(ownerUserId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Trip> findAllByStatusAndEndDateGreaterThanEqualAndOwnerUserIdNot(
            TripStatus status,
            LocalDate today,
            Long ownerUserId
    ) {
        return repository.findAllByStatusAndEndDateGreaterThanEqualAndOwnerUserIdNot(
                        status,
                        today,
                        ownerUserId
                )
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Trip> findAllByIds(List<Long> tripIds) {
        if (tripIds == null || tripIds.isEmpty()) {
            return List.of();
        }

        return repository.findAllByIdIn(tripIds).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Trip> findTripsToExpire(LocalDate today) {
        return repository.findByEndDateBeforeAndStatusIn(
                        today,
                        List.of(TripStatus.OPEN, TripStatus.FULL)
                )
                .stream()
                .map(this::toDomain)
                .toList();
    }

    private Trip toDomain(TripJpaEntity entity) {
        return Trip.builder()
                .id(entity.getId())
                .ownerUserId(entity.getOwnerUserId())
                .title(entity.getTitle())
                .destinationCity(entity.getDestinationCity())
                .destinationCountry(entity.getDestinationCountry())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .budget(entity.getBudget())
                .tripType(entity.getTripType())
                .description(entity.getDescription())
                .targetGroupSize(entity.getTargetGroupSize())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}