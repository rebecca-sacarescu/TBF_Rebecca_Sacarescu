package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.enums.TripMemberRole;

import java.util.List;

public interface TripMemberGateway {

    TripMember save(TripMember tripMember);

    boolean existsActiveByTripIdAndUserId(Long tripId, Long userId);

    long countActiveByTripId(Long tripId);

    List<TripMember> findAllActiveByTripId(Long tripId);

    List<TripMember> findAllActiveByUserId(Long userId);

    List<TripMember> findAllActiveByUserIdAndRole(Long userId, TripMemberRole role);
}