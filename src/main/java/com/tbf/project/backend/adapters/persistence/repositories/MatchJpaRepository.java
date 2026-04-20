package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.MatchJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchJpaRepository extends JpaRepository<MatchJpaEntity, Long> {

    Optional<MatchJpaEntity> findByUser1IdAndUser2IdAndDeletedAtIsNull(Long user1Id, Long user2Id);

    List<MatchJpaEntity> findAllByUser1IdAndDeletedAtIsNull(Long user1Id);

    List<MatchJpaEntity> findAllByUser2IdAndDeletedAtIsNull(Long user2Id);

    Optional<MatchJpaEntity> findByIdAndDeletedAtIsNull(Long id);
}