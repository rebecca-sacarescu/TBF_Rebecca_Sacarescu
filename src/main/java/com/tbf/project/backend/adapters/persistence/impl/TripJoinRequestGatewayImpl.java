package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.TripJoinRequestJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.TripJoinRequestJpaRepository;
import com.tbf.project.backend.entities.gateway.TripJoinRequestGateway;
import com.tbf.project.backend.entities.model.TripJoinRequest;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TripJoinRequestGatewayImpl implements TripJoinRequestGateway {

    private final TripJoinRequestJpaRepository repository;

    @Override
    public TripJoinRequest save(TripJoinRequest request) {
        TripJoinRequestJpaEntity entity = TripJoinRequestJpaEntity.builder()
                .id(request.getId())
                .tripId(request.getTripId())
                .requesterUserId(request.getRequesterUserId())
                .message(request.getMessage())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .resolvedAt(request.getResolvedAt())
                .build();

        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<TripJoinRequest> findById(Long requestId) {
        return repository.findById(requestId).map(this::toDomain);
    }

    @Override
    public Optional<TripJoinRequest> findByTripIdAndRequesterUserId(Long tripId, Long requesterUserId) {
        return repository.findByTripIdAndRequesterUserId(tripId, requesterUserId)
                .map(this::toDomain);
    }

    @Override
    public boolean existsByTripIdAndRequesterUserIdAndStatus(
            Long tripId,
            Long requesterUserId,
            TripJoinRequestStatus status
    ) {
        return repository.existsByTripIdAndRequesterUserIdAndStatus(tripId, requesterUserId, status);
    }

    @Override
    public List<TripJoinRequest> findAllByTripIdAndStatus(Long tripId, TripJoinRequestStatus status) {
        return repository.findAllByTripIdAndStatus(tripId, status).stream()
                .map(this::toDomain)
                .toList();
    }

    private TripJoinRequest toDomain(TripJoinRequestJpaEntity entity) {
        return TripJoinRequest.builder()
                .id(entity.getId())
                .tripId(entity.getTripId())
                .requesterUserId(entity.getRequesterUserId())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .resolvedAt(entity.getResolvedAt())
                .build();
    }
}