package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.ProfileInteractionEventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileInteractionEventJpaRepository extends JpaRepository<ProfileInteractionEventJpaEntity, Long> {
}