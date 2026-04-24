package com.tbf.project.backend.application.service;

import com.tbf.project.backend.application.dto.DirectionalCompatibilityResult;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class DirectionalProfileSimilarityCalculator {

    private final ProfileVectorizer profileVectorizer;

    public DirectionalProfileSimilarityCalculator(ProfileVectorizer profileVectorizer) {
        this.profileVectorizer = profileVectorizer;
    }

    public DirectionalCompatibilityResult calculate(UserProfile source, UserProfile target) {
        if (source == null || target == null) {
            return emptyResult();
        }

        double socialSimilarity = ordinalSimilarity(
                profileVectorizer.toSocialValue(source.getSocialBattery()),
                profileVectorizer.toSocialValue(target.getSocialBattery()),
                2
        );

        double planningSimilarity = ordinalSimilarity(
                profileVectorizer.toPlanningValue(source.getPlanningStyle()),
                profileVectorizer.toPlanningValue(target.getPlanningStyle()),
                2
        );

        double budgetSimilarity = ordinalSimilarity(
                profileVectorizer.toBudgetValue(source.getBudget()),
                profileVectorizer.toBudgetValue(target.getBudget()),
                2
        );

        double activitiesSimilarity = jaccardSimilarity(source.getActivities(), target.getActivities());
        double languagesSimilarity = jaccardSimilarity(source.getLanguages(), target.getLanguages());
        double destinationTypesSimilarity = jaccardSimilarity(source.getDestinationTypes(), target.getDestinationTypes());
        double experienceTypesSimilarity = jaccardSimilarity(source.getExperienceTypes(), target.getExperienceTypes());
        double lookingForWhoSimilarity = jaccardSimilarity(source.getLookingForWho(), target.getLookingForWho());
        double lookingForWhatSimilarity = jaccardSimilarity(source.getLookingForWhat(), target.getLookingForWhat());

        double lifestyleScore =
                0.34 * socialSimilarity +
                        0.33 * planningSimilarity +
                        0.33 * budgetSimilarity;

        double interestScore =
                0.35 * activitiesSimilarity +
                        0.20 * languagesSimilarity +
                        0.20 * destinationTypesSimilarity +
                        0.15 * experienceTypesSimilarity +
                        0.10 * lookingForWhatSimilarity;

        double intentScore =
                0.55 * lookingForWhatSimilarity +
                        0.45 * lookingForWhoSimilarity;

        double practicalScore =
                0.45 * budgetSimilarity +
                        0.35 * planningSimilarity +
                        0.20 * languagesSimilarity;

        double normalizedScore =
                0.30 * lifestyleScore +
                        0.25 * interestScore +
                        0.20 * intentScore +
                        0.25 * practicalScore;

        normalizedScore = clamp01(normalizedScore);

        return new DirectionalCompatibilityResult(
                normalizedScore,
                toScore100(normalizedScore),

                lifestyleScore,
                interestScore,
                intentScore,
                practicalScore,

                socialSimilarity,
                planningSimilarity,
                budgetSimilarity,
                activitiesSimilarity,
                languagesSimilarity,
                destinationTypesSimilarity,
                experienceTypesSimilarity,
                lookingForWhoSimilarity,
                lookingForWhatSimilarity,

                1.0,
                List.of()
        );
    }

    private DirectionalCompatibilityResult emptyResult() {
        return new DirectionalCompatibilityResult(
                0.0,
                0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                0.0,
                1.0,
                List.of()
        );
    }

    private double ordinalSimilarity(int first, int second, int maxDiff) {
        if (first == 0 || second == 0 || maxDiff <= 0) {
            return 0.0;
        }

        double similarity = 1.0 - ((double) Math.abs(first - second) / maxDiff);
        return clamp01(similarity);
    }

    private double jaccardSimilarity(List<String> first, List<String> second) {
        Set<String> firstSet = profileVectorizer.normalizeSet(first);
        Set<String> secondSet = profileVectorizer.normalizeSet(second);

        if (firstSet.isEmpty() || secondSet.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(firstSet);
        intersection.retainAll(secondSet);

        Set<String> union = new HashSet<>(firstSet);
        union.addAll(secondSet);

        if (union.isEmpty()) {
            return 0.0;
        }

        return (double) intersection.size() / union.size();
    }

    private int toScore100(double normalizedScore) {
        return (int) Math.round(clamp01(normalizedScore) * 100.0);
    }

    private double clamp01(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }
}