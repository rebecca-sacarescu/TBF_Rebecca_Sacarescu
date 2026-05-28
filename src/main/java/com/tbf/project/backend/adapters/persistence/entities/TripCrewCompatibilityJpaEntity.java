package com.tbf.project.backend.adapters.persistence.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "trip_crew_compatibility",
        uniqueConstraints = @UniqueConstraint(columnNames = {"trip_id", "candidate_user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCrewCompatibilityJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "candidate_user_id", nullable = false)
    private Long candidateUserId;

    @Column(name = "overall_score", nullable = false)
    private int overallScore;

    @Column(name = "budget_score", nullable = false)
    private int budgetScore;

    @Column(name = "social_score", nullable = false)
    private int socialScore;

    @Column(name = "planning_score", nullable = false)
    private int planningScore;

    @Column(name = "interest_score", nullable = false)
    private int interestScore;

    @Column(name = "diversity_score", nullable = false)
    private int diversityScore;

    @Column(name = "highlights_json", columnDefinition = "TEXT")
    private String highlightsJson;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;
}