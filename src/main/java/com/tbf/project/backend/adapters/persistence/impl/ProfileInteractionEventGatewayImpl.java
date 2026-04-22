package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.ProfileInteractionEventJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.ProfileInteractionEventJpaRepository;
import com.tbf.project.backend.entities.gateway.ProfileInteractionEventGateway;
import com.tbf.project.backend.entities.model.ProfileInteractionEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProfileInteractionEventGatewayImpl implements ProfileInteractionEventGateway {

    private final ProfileInteractionEventJpaRepository repository;

    @Override
    public ProfileInteractionEvent save(ProfileInteractionEvent event) {
        ProfileInteractionEventJpaEntity entity = ProfileInteractionEventJpaEntity.builder()
                .id(event.getId())
                .actorUserId(event.getActorUserId())
                .targetUserId(event.getTargetUserId())
                .eventType(event.getEventType())
                .surface(event.getSurface())
                .dwellTimeMs(event.getDwellTimeMs())
                .createdAt(event.getCreatedAt())
                .build();

        ProfileInteractionEventJpaEntity saved = repository.save(entity);

        return ProfileInteractionEvent.builder()
                .id(saved.getId())
                .actorUserId(saved.getActorUserId())
                .targetUserId(saved.getTargetUserId())
                .eventType(saved.getEventType())
                .surface(saved.getSurface())
                .dwellTimeMs(saved.getDwellTimeMs())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}