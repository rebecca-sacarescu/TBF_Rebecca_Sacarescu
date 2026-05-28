package com.tbf.project.backend.application.service;

import com.tbf.project.backend.entities.model.TripCrewCompatibility;
import com.tbf.project.backend.entities.model.UserProfile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CrewCompatibilityService {

    private final ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator;
    private final ProfileVectorizer profileVectorizer;

    public CrewCompatibilityService(
            ReciprocalCompatibilityCalculator reciprocalCompatibilityCalculator,
            ProfileVectorizer profileVectorizer
    ) {
        this.reciprocalCompatibilityCalculator = reciprocalCompatibilityCalculator;
        this.profileVectorizer = profileVectorizer;
    }

    public TripCrewCompatibility compute(Long tripId, UserProfile candidate, List<UserProfile> crewProfiles) {
        int overallScore = computeOverallScore(candidate, crewProfiles);
        int budgetScore = computeBudgetScore(candidate, crewProfiles);
        int socialScore = computeSocialScore(candidate, crewProfiles);
        int planningScore = computePlanningScore(candidate, crewProfiles);
        int interestScore = computeInterestScore(candidate, crewProfiles);
        int diversityScore = computeDiversityScore(candidate, crewProfiles);
        List<String> highlights = buildHighlights(budgetScore, socialScore, planningScore, interestScore, diversityScore);

        return TripCrewCompatibility.builder()
                .tripId(tripId)
                .candidateUserId(candidate.getUserId())
                .overallScore(overallScore)
                .budgetScore(budgetScore)
                .socialScore(socialScore)
                .planningScore(planningScore)
                .interestScore(interestScore)
                .diversityScore(diversityScore)
                .highlights(highlights)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    private int computeOverallScore(UserProfile candidate, List<UserProfile> crew) {
        if (crew.isEmpty()) {
            return 0;
        }

        double sum = 0.0;
        for (UserProfile member : crew) {
            double reciprocal = reciprocalCompatibilityCalculator
                    .calculate(candidate, member)
                    .reciprocalNormalizedScore();
            sum += reciprocal;
        }

        double avg = sum / crew.size();
        return (int) Math.round(avg * 100.0);
    }

    private int computeBudgetScore(UserProfile candidate, List<UserProfile> crew) {
        if (crew.isEmpty() || candidate.getBudget() == null) {
            return 0;
        }

        long matching = crew.stream()
                .filter(m -> candidate.getBudget().equals(m.getBudget()))
                .count();

        return (int) Math.round((double) matching / crew.size() * 100.0);
    }

    private int computeSocialScore(UserProfile candidate, List<UserProfile> crew) {
        if (crew.isEmpty() || candidate.getSocialBattery() == null) {
            return 0;
        }

        int candidateVal = profileVectorizer.toSocialValue(candidate.getSocialBattery());
        double totalSimilarity = 0.0;

        for (UserProfile member : crew) {
            if (member.getSocialBattery() == null) continue;
            int memberVal = profileVectorizer.toSocialValue(member.getSocialBattery());
            totalSimilarity += 1.0 - ((double) Math.abs(candidateVal - memberVal) / 2.0);
        }

        return (int) Math.round(totalSimilarity / crew.size() * 100.0);
    }

    private int computePlanningScore(UserProfile candidate, List<UserProfile> crew) {
        if (crew.isEmpty() || candidate.getPlanningStyle() == null) {
            return 0;
        }

        int candidateVal = profileVectorizer.toPlanningValue(candidate.getPlanningStyle());
        double totalSimilarity = 0.0;

        for (UserProfile member : crew) {
            if (member.getPlanningStyle() == null) continue;
            int memberVal = profileVectorizer.toPlanningValue(member.getPlanningStyle());
            totalSimilarity += 1.0 - ((double) Math.abs(candidateVal - memberVal) / 2.0);
        }

        return (int) Math.round(totalSimilarity / crew.size() * 100.0);
    }

    private int computeInterestScore(UserProfile candidate, List<UserProfile> crew) {
        if (crew.isEmpty()) {
            return 0;
        }

        Set<String> candidateActivities = profileVectorizer.normalizeSet(candidate.getActivities());
        if (candidateActivities.isEmpty()) {
            return 0;
        }

        Set<String> crewActivities = new HashSet<>();
        for (UserProfile member : crew) {
            crewActivities.addAll(profileVectorizer.normalizeSet(member.getActivities()));
        }

        if (crewActivities.isEmpty()) {
            return 0;
        }

        Set<String> intersection = new HashSet<>(candidateActivities);
        intersection.retainAll(crewActivities);

        Set<String> union = new HashSet<>(candidateActivities);
        union.addAll(crewActivities);

        return (int) Math.round((double) intersection.size() / union.size() * 100.0);
    }

    private int computeDiversityScore(UserProfile candidate, List<UserProfile> crew) {
        if (crew.isEmpty()) {
            return 50;
        }

        Set<String> origins = new HashSet<>();
        if (candidate.getOriginCountry() != null) {
            origins.add(candidate.getOriginCountry().trim().toLowerCase());
        }
        for (UserProfile member : crew) {
            if (member.getOriginCountry() != null) {
                origins.add(member.getOriginCountry().trim().toLowerCase());
            }
        }

        int total = crew.size() + 1;
        double ratio = (double) origins.size() / total;

        if (ratio >= 0.75) return 100;
        if (ratio >= 0.50) return 75;
        if (ratio >= 0.25) return 50;
        return 25;
    }

    private List<String> buildHighlights(
            int budgetScore,
            int socialScore,
            int planningScore,
            int interestScore,
            int diversityScore
    ) {
        List<String> highlights = new ArrayList<>();

        if (budgetScore >= 80) {
            highlights.add("Compatible budget");
        } else if (budgetScore < 40) {
            highlights.add("Different budget range");
        }

        if (socialScore >= 80) {
            highlights.add("Similar social energy");
        } else if (socialScore < 40) {
            highlights.add("Different social energy");
        }

        if (planningScore >= 80) {
            highlights.add("Similar travel pace");
        } else if (planningScore < 40) {
            highlights.add("Different planning style");
        }

        if (interestScore >= 60) {
            highlights.add("Shared travel interests");
        }

        if (diversityScore >= 75) {
            highlights.add("International crew");
        }

        return highlights;
    }
}