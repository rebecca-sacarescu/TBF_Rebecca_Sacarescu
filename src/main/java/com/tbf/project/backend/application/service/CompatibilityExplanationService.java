package com.tbf.project.backend.application.service;

import com.tbf.project.backend.application.dto.ReciprocalCompatibilityResult;
import com.tbf.project.backend.entities.model.UserProfile;

import java.util.ArrayList;
import java.util.List;

public class CompatibilityExplanationService {

    private final ProfileVectorizer profileVectorizer;

    public CompatibilityExplanationService(ProfileVectorizer profileVectorizer) {
        this.profileVectorizer = profileVectorizer;
    }

    public List<String> buildContextBadges(
            UserProfile currentUser,
            UserProfile otherUser,
            ReciprocalCompatibilityResult result,
            boolean superLikeInvolved
    ) {
        List<String> badges = new ArrayList<>();

        if (result.forward().budgetSimilarity() >= 0.99) {
            badges.add("Same budget");
        } else if (result.forward().budgetSimilarity() >= 0.50) {
            badges.add("Compatible budget");
        }

        if (result.forward().planningSimilarity() >= 0.99) {
            badges.add("Same planning style");
        } else if (result.forward().planningSimilarity() >= 0.50) {
            badges.add("Compatible planning rhythm");
        }

        if (result.forward().socialSimilarity() >= 0.99) {
            badges.add("Same social energy");
        } else if (result.forward().socialSimilarity() >= 0.50) {
            badges.add("Similar social energy");
        }

        int sharedLanguages = profileVectorizer.overlapCount(currentUser.getLanguages(), otherUser.getLanguages());
        if (sharedLanguages > 0) {
            badges.add(sharedLanguages + " shared language" + (sharedLanguages > 1 ? "s" : ""));
        }

        int sharedActivities = profileVectorizer.overlapCount(currentUser.getActivities(), otherUser.getActivities());
        if (sharedActivities > 0) {
            badges.add(sharedActivities + " shared activit" + (sharedActivities > 1 ? "ies" : "y"));
        }

        badges.addAll(result.highlights());

        if (superLikeInvolved) {
            badges.add("Super Like");
        }

        return distinct(badges);
    }

    public String buildWhyYouMatched(
            UserProfile currentUser,
            UserProfile otherUser,
            ReciprocalCompatibilityResult result,
            boolean superLikeInvolved
    ) {
        List<String> reasons = new ArrayList<>();

        if (result.forward().budgetSimilarity() >= 0.75) {
            reasons.add("your travel budgets are compatible");
        }

        if (result.forward().planningSimilarity() >= 0.75) {
            reasons.add("your planning styles align well");
        }

        if (result.forward().socialSimilarity() >= 0.75) {
            reasons.add("your social energy is compatible");
        }

        int sharedActivities = profileVectorizer.overlapCount(currentUser.getActivities(), otherUser.getActivities());
        if (sharedActivities > 0) {
            reasons.add("you share " + sharedActivities + " travel activit" + (sharedActivities > 1 ? "ies" : "y"));
        }

        int sharedLanguages = profileVectorizer.overlapCount(currentUser.getLanguages(), otherUser.getLanguages());
        if (sharedLanguages > 0) {
            reasons.add("you share " + sharedLanguages + " language" + (sharedLanguages > 1 ? "s" : ""));
        }

        if (result.forward().intentScore() >= 0.60 && result.reverse().intentScore() >= 0.60) {
            reasons.add("your travel intentions are mutually aligned");
        }

        if (superLikeInvolved) {
            reasons.add("a Super Like made the connection stand out");
        }

        if (reasons.isEmpty()) {
            return "You matched because your profiles show reciprocal travel compatibility and mutual interest.";
        }

        return "You matched because " + String.join(", ", reasons) + ".";
    }

    private List<String> distinct(List<String> values) {
        List<String> result = new ArrayList<>();
        for (String value : values) {
            if (!result.contains(value)) {
                result.add(value);
            }
        }
        return result;
    }
}