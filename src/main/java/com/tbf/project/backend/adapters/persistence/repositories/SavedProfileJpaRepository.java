package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.SavedProfileJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedProfileJpaRepository extends JpaRepository<SavedProfileJpaEntity, Long> {

    Optional<SavedProfileJpaEntity> findByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);

    boolean existsByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);

    List<SavedProfileJpaEntity> findAllByActorUserId(Long actorUserId);

    void deleteByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);
}