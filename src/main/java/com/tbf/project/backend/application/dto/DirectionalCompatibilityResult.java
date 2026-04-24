package com.tbf.project.backend.application.dto;

import java.util.List;

public record DirectionalCompatibilityResult(
        double normalizedScore,
        int score100,

        double lifestyleScore,
        double interestScore,
        double intentScore,
        double practicalScore,

        double socialSimilarity,
        double planningSimilarity,
        double budgetSimilarity,
        double activitiesSimilarity,
        double languagesSimilarity,
        double destinationTypesSimilarity,
        double experienceTypesSimilarity,
        double lookingForWhoSimilarity,
        double lookingForWhatSimilarity,

        double penaltyFactor,
        List<String> appliedPenalties
) {
}