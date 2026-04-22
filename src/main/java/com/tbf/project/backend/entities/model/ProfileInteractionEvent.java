package com.tbf.project.backend.entities.model;

import com.tbf.project.backend.entities.model.enums.InteractionSurface;
import com.tbf.project.backend.entities.model.enums.ProfileInteractionEventType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ProfileInteractionEvent {
    private Long id;
    private Long actorUserId;
    private Long targetUserId;
    private ProfileInteractionEventType eventType;
    private InteractionSurface surface;
    private Long dwellTimeMs;
    private LocalDateTime createdAt;
}