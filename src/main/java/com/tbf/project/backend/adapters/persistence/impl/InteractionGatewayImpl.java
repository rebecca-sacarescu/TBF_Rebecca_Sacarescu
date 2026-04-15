package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.ProfileInteractionJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.ProfileInteractionJpaRepository;
import com.tbf.project.backend.entities.gateway.InteractionGateway;
import com.tbf.project.backend.entities.model.ProfileInteraction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InteractionGatewayImpl implements InteractionGateway {

    private final ProfileInteractionJpaRepository repository;

    @Override
    public Optional<ProfileInteraction> findByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId) {
        return repository.findByActorUserIdAndTargetUserId(actorUserId, targetUserId)
                .map(this::toDomain);
    }

    @Override
    public ProfileInteraction save(ProfileInteraction interaction) {
        ProfileInteractionJpaEntity entity = ProfileInteractionJpaEntity.builder()
                .id(interaction.getId())
                .actorUserId(interaction.getActorUserId())
                .targetUserId(interaction.getTargetUserId())
                .interactionType(interaction.getInteractionType())
                .createdAt(interaction.getCreatedAt())
                .updatedAt(interaction.getUpdatedAt())
                .build();

        ProfileInteractionJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<Long> findTargetUserIdsByActorUserId(Long actorUserId) {
        return repository.findAllByActorUserId(actorUserId).stream()
                .map(ProfileInteractionJpaEntity::getTargetUserId)
                .toList();
    }

    private ProfileInteraction toDomain(ProfileInteractionJpaEntity entity) {
        return ProfileInteraction.builder()
                .id(entity.getId())
                .actorUserId(entity.getActorUserId())
                .targetUserId(entity.getTargetUserId())
                .interactionType(entity.getInteractionType())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}