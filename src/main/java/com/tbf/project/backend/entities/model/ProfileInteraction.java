package com.tbf.project.backend.entities.model;

import com.tbf.project.backend.entities.model.enums.InteractionType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ProfileInteraction {
    private Long id;
    private Long actorUserId;
    private Long targetUserId;
    private InteractionType interactionType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}