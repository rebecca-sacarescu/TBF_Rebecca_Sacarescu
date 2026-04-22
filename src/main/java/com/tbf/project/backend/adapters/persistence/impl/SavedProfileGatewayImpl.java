package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.SavedProfileJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.SavedProfileJpaRepository;
import com.tbf.project.backend.entities.gateway.SavedProfileGateway;
import com.tbf.project.backend.entities.model.SavedProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SavedProfileGatewayImpl implements SavedProfileGateway {

    private final SavedProfileJpaRepository repository;

    @Override
    public SavedProfile save(SavedProfile savedProfile) {
        SavedProfileJpaEntity entity = SavedProfileJpaEntity.builder()
                .id(savedProfile.getId())
                .actorUserId(savedProfile.getActorUserId())
                .targetUserId(savedProfile.getTargetUserId())
                .createdAt(savedProfile.getCreatedAt())
                .updatedAt(savedProfile.getUpdatedAt())
                .build();

        return toDomain(repository.save(entity));
    }

    @Override
    public Optional<SavedProfile> findByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId) {
        return repository.findByActorUserIdAndTargetUserId(actorUserId, targetUserId)
                .map(this::toDomain);
    }

    @Override
    public boolean existsByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId) {
        return repository.existsByActorUserIdAndTargetUserId(actorUserId, targetUserId);
    }

    @Override
    public List<SavedProfile> findAllByActorUserId(Long actorUserId) {
        return repository.findAllByActorUserId(actorUserId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void deleteByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId) {
        repository.deleteByActorUserIdAndTargetUserId(actorUserId, targetUserId);
    }

    private SavedProfile toDomain(SavedProfileJpaEntity entity) {
        return SavedProfile.builder()
                .id(entity.getId())
                .actorUserId(entity.getActorUserId())
                .targetUserId(entity.getTargetUserId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}