package com.tbf.project.backend.entities.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AiTripPlan {
    private Long id;
    private Long tripId;
    private Long generatedByUserId;
    private String planJson;
    private LocalDateTime generatedAt;
    private LocalDateTime updatedAt;
}