package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.TripJoinRequest;
import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;

import java.util.List;
import java.util.Optional;

public interface TripJoinRequestGateway {

    TripJoinRequest save(TripJoinRequest request);

    Optional<TripJoinRequest> findById(Long requestId);

    Optional<TripJoinRequest> findByTripIdAndRequesterUserId(Long tripId, Long requesterUserId);

    boolean existsByTripIdAndRequesterUserIdAndStatus(
            Long tripId,
            Long requesterUserId,
            TripJoinRequestStatus status
    );

    List<TripJoinRequest> findAllByTripIdAndStatus(Long tripId, TripJoinRequestStatus status);
}