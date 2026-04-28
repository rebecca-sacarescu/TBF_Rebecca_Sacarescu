package com.tbf.project.backend.adapters.persistence.repositories;

import com.tbf.project.backend.adapters.persistence.entities.TripJpaEntity;
import com.tbf.project.backend.entities.model.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripJpaRepository extends JpaRepository<TripJpaEntity, Long> {

    List<TripJpaEntity> findAllByOwnerUserId(Long ownerUserId);

    List<TripJpaEntity> findAllByStatusAndEndDateGreaterThanEqualAndOwnerUserIdNot(
            TripStatus status,
            LocalDate today,
            Long ownerUserId
    );

    List<TripJpaEntity> findAllByIdIn(List<Long> ids);

    List<TripJpaEntity> findByEndDateBeforeAndStatusIn(
            LocalDate today,
            List<TripStatus> statuses
    );
}