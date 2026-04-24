package com.tbf.project.backend.application.service;

import com.tbf.project.backend.application.dto.DirectionalCompatibilityResult;
import com.tbf.project.backend.application.dto.ReciprocalCompatibilityResult;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class ReciprocalCompatibilityCalculator {

    private final DirectionalProfileSimilarityCalculator directionalCalculator;
    private final CompatibilityPenaltyCalculator penaltyCalculator;

    public ReciprocalCompatibilityCalculator(
            DirectionalProfileSimilarityCalculator directionalCalculator,
            CompatibilityPenaltyCalculator penaltyCalculator
    ) {
        this.directionalCalculator = directionalCalculator;
        this.penaltyCalculator = penaltyCalculator;
    }

    public ReciprocalCompatibilityResult calculate(UserProfile first, UserProfile second) {
        DirectionalCompatibilityResult forwardBase = directionalCalculator.calculate(first, second);
        DirectionalCompatibilityResult reverseBase = directionalCalculator.calculate(second, first);

        CompatibilityPenaltyCalculator.PenaltyResult forwardPenalty = penaltyCalculator.calculate(first, second);
        CompatibilityPenaltyCalculator.PenaltyResult reversePenalty = penaltyCalculator.calculate(second, first);

        DirectionalCompatibilityResult forward = applyPenalty(forwardBase, forwardPenalty);
        DirectionalCompatibilityResult reverse = applyPenalty(reverseBase, reversePenalty);

        double reciprocalNormalizedScore = harmonicMean(
                forward.normalizedScore(),
                reverse.normalizedScore()
        );

        List<String> penaltiesApplied = mergeDistinct(
                forward.appliedPenalties(),
                reverse.appliedPenalties()
        );

        List<String> highlights = buildHighlights(forward, reverse);

        return new ReciprocalCompatibilityResult(
                forward,
                reverse,
                reciprocalNormalizedScore,
                toScore100(reciprocalNormalizedScore),
                highlights,
                penaltiesApplied
        );
    }

    private DirectionalCompatibilityResult applyPenalty(
            DirectionalCompatibilityResult base,
            CompatibilityPenaltyCalculator.PenaltyResult penalty
    ) {
        double penalizedNormalizedScore = clamp01(base.normalizedScore() * penalty.penaltyFactor());

        return new DirectionalCompatibilityResult(
                penalizedNormalizedScore,
                toScore100(penalizedNormalizedScore),

                base.lifestyleScore(),
                base.interestScore(),
                base.intentScore(),
                base.practicalScore(),

                base.socialSimilarity(),
                base.planningSimilarity(),
                base.budgetSimilarity(),
                base.activitiesSimilarity(),
                base.languagesSimilarity(),
                base.destinationTypesSimilarity(),
                base.experienceTypesSimilarity(),
                base.lookingForWhoSimilarity(),
                base.lookingForWhatSimilarity(),

                penalty.penaltyFactor(),
                penalty.penalties()
        );
    }

    private List<String> buildHighlights(
            DirectionalCompatibilityResult forward,
            DirectionalCompatibilityResult reverse
    ) {
        List<String> highlights = new ArrayList<>();

        double avgLifestyle = (forward.lifestyleScore() + reverse.lifestyleScore()) / 2.0;
        double avgInterest = (forward.interestScore() + reverse.interestScore()) / 2.0;
        double avgIntent = (forward.intentScore() + reverse.intentScore()) / 2.0;
        double avgPractical = (forward.practicalScore() + reverse.practicalScore()) / 2.0;

        if (avgLifestyle >= 0.75) {
            highlights.add("Strong lifestyle alignment");
        }

        if (avgInterest >= 0.60) {
            highlights.add("Shared travel interests");
        }

        if (avgIntent >= 0.60) {
            highlights.add("Aligned travel intentions");
        }

        if (avgPractical >= 0.65) {
            highlights.add("Good practical fit");
        }

        return highlights;
    }

    private double harmonicMean(double first, double second) {
        if (first <= 0.0 || second <= 0.0) {
            return 0.0;
        }
        return (2.0 * first * second) / (first + second);
    }

    private List<String> mergeDistinct(List<String> first, List<String> second) {
        Set<String> merged = new LinkedHashSet<>();
        merged.addAll(first);
        merged.addAll(second);
        return new ArrayList<>(merged);
    }

    private int toScore100(double normalizedScore) {
        return (int) Math.round(clamp01(normalizedScore) * 100.0);
    }

    private double clamp01(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }
}