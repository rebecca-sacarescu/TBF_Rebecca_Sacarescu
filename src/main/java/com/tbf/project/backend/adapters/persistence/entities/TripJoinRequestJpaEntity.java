package com.tbf.project.backend.adapters.persistence.entities;

import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "trip_join_requests",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_trip_join_requests_trip_requester", columnNames = {"trip_id", "requester_user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripJoinRequestJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "requester_user_id", nullable = false)
    private Long requesterUserId;

    @Column(length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripJoinRequestStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}