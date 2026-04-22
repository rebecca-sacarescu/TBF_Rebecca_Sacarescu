package com.tbf.project.backend.adapters.persistence.entities;

import com.tbf.project.backend.entities.model.enums.InteractionSurface;
import com.tbf.project.backend.entities.model.enums.ProfileInteractionEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_interaction_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileInteractionEventJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private ProfileInteractionEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "surface", nullable = false)
    private InteractionSurface surface;

    @Column(name = "dwell_time_ms")
    private Long dwellTimeMs;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}