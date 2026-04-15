package com.tbf.project.backend.application.service;

import com.tbf.project.backend.entities.model.UserProfile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ProfileCompatibilityCalculator {

    public int calculateScore(UserProfile currentUser, UserProfile candidate) {
        if (currentUser == null || candidate == null) {
            return 0;
        }

        double score = 0.0;

        // Fixed enums
        if (currentUser.getSocialBattery() == candidate.getSocialBattery()) {
            score += 20;
        }

        if (currentUser.getPlanningStyle() == candidate.getPlanningStyle()) {
            score += 20;
        }

        if (currentUser.getBudget() == candidate.getBudget()) {
            score += 20;
        }

        // List overlaps
        score += overlapScore(currentUser.getActivities(), candidate.getActivities(), 15);
        score += overlapScore(currentUser.getLanguages(), candidate.getLanguages(), 10);
        score += overlapScore(currentUser.getLookingForWhat(), candidate.getLookingForWhat(), 15);

        return (int) Math.round(Math.min(score, 100));
    }

    private double overlapScore(List<String> first, List<String> second, double maxPoints) {
        if (first == null || second == null || first.isEmpty() || second.isEmpty()) {
            return 0;
        }

        Set<String> firstSet = normalize(first);
        Set<String> secondSet = normalize(second);

        if (firstSet.isEmpty() || secondSet.isEmpty()) {
            return 0;
        }

        Set<String> intersection = new HashSet<>(firstSet);
        intersection.retainAll(secondSet);

        Set<String> union = new HashSet<>(firstSet);
        union.addAll(secondSet);

        if (union.isEmpty()) {
            return 0;
        }

        double jaccard = (double) intersection.size() / union.size();
        return jaccard * maxPoints;
    }

    private Set<String> normalize(List<String> values) {
        Set<String> normalized = new HashSet<>();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                normalized.add(value.trim().toLowerCase());
            }
        }
        return normalized;
    }
}