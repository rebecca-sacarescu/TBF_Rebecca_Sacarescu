package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.TripMemberJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.TripMemberJpaRepository;
import com.tbf.project.backend.entities.gateway.TripMemberGateway;
import com.tbf.project.backend.entities.model.TripMember;
import com.tbf.project.backend.entities.model.enums.TripMemberRole;
import com.tbf.project.backend.entities.model.enums.TripMemberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TripMemberGatewayImpl implements TripMemberGateway {

    private final TripMemberJpaRepository repository;

    @Override
    public TripMember save(TripMember tripMember) {
        TripMemberJpaEntity entity = TripMemberJpaEntity.builder()
                .id(tripMember.getId())
                .tripId(tripMember.getTripId())
                .userId(tripMember.getUserId())
                .role(tripMember.getRole())
                .status(tripMember.getStatus())
                .joinedAt(tripMember.getJoinedAt())
                .build();

        return toDomain(repository.save(entity));
    }

    @Override
    public boolean existsActiveByTripIdAndUserId(Long tripId, Long userId) {
        return repository.existsByTripIdAndUserIdAndStatus(tripId, userId, TripMemberStatus.ACTIVE);
    }

    @Override
    public long countActiveByTripId(Long tripId) {
        return repository.countByTripIdAndStatus(tripId, TripMemberStatus.ACTIVE);
    }

    @Override
    public List<TripMember> findAllActiveByTripId(Long tripId) {
        return repository.findAllByTripIdAndStatus(tripId, TripMemberStatus.ACTIVE).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<TripMember> findAllActiveByUserId(Long userId) {
        return repository.findAllByUserIdAndStatus(userId, TripMemberStatus.ACTIVE).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<TripMember> findAllActiveByUserIdAndRole(Long userId, TripMemberRole role) {
        return repository.findAllByUserIdAndRoleAndStatus(userId, role, TripMemberStatus.ACTIVE).stream()
                .map(this::toDomain)
                .toList();
    }

    private TripMember toDomain(TripMemberJpaEntity entity) {
        return TripMember.builder()
                .id(entity.getId())
                .tripId(entity.getTripId())
                .userId(entity.getUserId())
                .role(entity.getRole())
                .status(entity.getStatus())
                .joinedAt(entity.getJoinedAt())
                .build();
    }
}