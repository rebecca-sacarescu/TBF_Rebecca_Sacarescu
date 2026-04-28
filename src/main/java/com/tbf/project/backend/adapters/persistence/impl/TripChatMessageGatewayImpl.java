package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.TripChatMessageJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.TripChatMessageJpaRepository;
import com.tbf.project.backend.entities.gateway.TripChatMessageGateway;
import com.tbf.project.backend.entities.model.TripChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TripChatMessageGatewayImpl implements TripChatMessageGateway {

    private final TripChatMessageJpaRepository repository;

    @Override
    public TripChatMessage save(TripChatMessage message) {
        TripChatMessageJpaEntity entity = TripChatMessageJpaEntity.builder()
                .id(message.getId())
                .tripId(message.getTripId())
                .senderUserId(message.getSenderUserId())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .createdAt(message.getCreatedAt())
                .editedAt(message.getEditedAt())
                .deletedAt(message.getDeletedAt())
                .build();

        return toDomain(repository.save(entity));
    }

    @Override
    public List<TripChatMessage> findByTripIdOrderByCreatedAtAscIdAsc(
            Long tripId,
            int page,
            int size
    ) {
        return repository.findAllByTripIdAndDeletedAtIsNullOrderByCreatedAtAscIdAsc(
                        tripId,
                        PageRequest.of(page, size)
                )
                .stream()
                .map(this::toDomain)
                .toList();
    }

    private TripChatMessage toDomain(TripChatMessageJpaEntity entity) {
        return TripChatMessage.builder()
                .id(entity.getId())
                .tripId(entity.getTripId())
                .senderUserId(entity.getSenderUserId())
                .content(entity.getContent())
                .messageType(entity.getMessageType())
                .createdAt(entity.getCreatedAt())
                .editedAt(entity.getEditedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }
}