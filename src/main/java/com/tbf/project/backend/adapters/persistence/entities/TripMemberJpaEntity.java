package com.tbf.project.backend.adapters.persistence.entities;

import com.tbf.project.backend.entities.model.enums.TripMemberRole;
import com.tbf.project.backend.entities.model.enums.TripMemberStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "trip_members",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_trip_members_trip_user", columnNames = {"trip_id", "user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripMemberJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripMemberRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripMemberStatus status;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;
}