package com.tbf.project.backend.entities.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class TripCrewCompatibility {
    private Long id;
    private Long tripId;
    private Long candidateUserId;
    private int overallScore;
    private int budgetScore;
    private int socialScore;
    private int planningScore;
    private int interestScore;
    private int diversityScore;
    private List<String> highlights;
    private LocalDateTime calculatedAt;
}