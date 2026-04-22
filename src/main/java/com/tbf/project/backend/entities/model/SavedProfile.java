package com.tbf.project.backend.entities.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class SavedProfile {
    private Long id;
    private Long actorUserId;
    private Long targetUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}