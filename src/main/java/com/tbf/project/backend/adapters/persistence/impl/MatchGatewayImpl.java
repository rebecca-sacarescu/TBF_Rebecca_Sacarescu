package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.MatchJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.MatchJpaRepository;
import com.tbf.project.backend.entities.gateway.MatchGateway;
import com.tbf.project.backend.entities.model.Match;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MatchGatewayImpl implements MatchGateway {

    private final MatchJpaRepository repository;

    @Override
    public Optional<Match> findActiveByUserPair(Long userAId, Long userBId) {
        long user1Id = Math.min(userAId, userBId);
        long user2Id = Math.max(userAId, userBId);

        return repository.findByUser1IdAndUser2IdAndDeletedAtIsNull(user1Id, user2Id)
                .map(this::toDomain);
    }

    @Override
    public Match save(Match match) {
        MatchJpaEntity entity = MatchJpaEntity.builder()
                .id(match.getId())
                .user1Id(match.getUser1Id())
                .user2Id(match.getUser2Id())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .deletedAt(match.getDeletedAt())
                .build();

        return toDomain(repository.save(entity));
    }

    @Override
    public List<Match> findActiveByUserId(Long userId) {
        List<Match> result = new ArrayList<>();

        repository.findAllByUser1IdAndDeletedAtIsNull(userId)
                .stream()
                .map(this::toDomain)
                .forEach(result::add);

        repository.findAllByUser2IdAndDeletedAtIsNull(userId)
                .stream()
                .map(this::toDomain)
                .forEach(result::add);

        return result;
    }

    @Override
    public Optional<Match> findActiveByIdAndUserId(Long matchId, Long userId) {
        return repository.findByIdAndDeletedAtIsNull(matchId)
                .map(this::toDomain)
                .filter(match -> match.involvesUser(userId));
    }

    @Override
    @Transactional
    public void softDelete(Long matchId) {
        repository.findByIdAndDeletedAtIsNull(matchId).ifPresent(entity -> {
            entity.setDeletedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            repository.save(entity);
        });
    }

    private Match toDomain(MatchJpaEntity entity) {
        return Match.builder()
                .id(entity.getId())
                .user1Id(entity.getUser1Id())
                .user2Id(entity.getUser2Id())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }
}