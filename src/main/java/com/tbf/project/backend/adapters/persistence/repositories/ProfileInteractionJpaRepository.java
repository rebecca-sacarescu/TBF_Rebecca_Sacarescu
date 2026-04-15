package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.ProfileInteractionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileInteractionJpaRepository extends JpaRepository<ProfileInteractionJpaEntity, Long> {

    Optional<ProfileInteractionJpaEntity> findByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);

    List<ProfileInteractionJpaEntity> findAllByActorUserId(Long actorUserId);
}